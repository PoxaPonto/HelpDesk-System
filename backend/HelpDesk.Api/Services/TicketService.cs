using HelpDesk.Api.Data;
using HelpDesk.Api.DTOs.Tickets;
using HelpDesk.Api.Enums;
using HelpDesk.Api.Models;
using HelpDesk.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HelpDesk.Api.Services;

public class TicketService(
    AppDbContext context,
    IAuditLogService auditLogService) : ITicketService
{
    public async Task<IReadOnlyList<TicketResponseDto>> GetAllAsync(
        TicketQueryDto query,
        Guid currentUserId,
        UserRole currentUserRole)
    {
        var tickets = BaseQuery();

        tickets = currentUserRole switch
        {
            UserRole.Admin => tickets,
            UserRole.Technician => tickets.Where(ticket => ticket.TechnicianId == currentUserId || ticket.TechnicianId == null),
            UserRole.Client => tickets.Where(ticket => ticket.ClientId == currentUserId),
            _ => tickets.Where(ticket => false)
        };

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim().ToLower();
            tickets = tickets.Where(ticket => ticket.Title.ToLower().Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(query.Status))
        {
            var status = ParseStatus(query.Status);
            tickets = tickets.Where(ticket => ticket.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(query.Priority))
        {
            var priority = ParsePriority(query.Priority);
            tickets = tickets.Where(ticket => ticket.Priority == priority);
        }

        if (query.CategoryId.HasValue)
        {
            tickets = tickets.Where(ticket => ticket.CategoryId == query.CategoryId.Value);
        }

        var sort = query.Sort?.Trim().ToLower();
        tickets = sort == "oldest" || sort == "maisantigos"
            ? tickets.OrderBy(ticket => ticket.CreatedAt)
            : tickets.OrderByDescending(ticket => ticket.CreatedAt);

        var page = Math.Max(query.Page, 1);
        var pageSize = Math.Clamp(query.PageSize, 1, 100);

        return await tickets
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(ticket => ToResponse(ticket))
            .ToListAsync();
    }

    public async Task<TicketResponseDto> GetByIdAsync(Guid id, Guid currentUserId, UserRole currentUserRole)
    {
        var ticket = await BaseQuery().FirstOrDefaultAsync(ticket => ticket.Id == id)
            ?? throw new KeyNotFoundException("Chamado nao encontrado.");

        EnsureCanView(ticket, currentUserId, currentUserRole);
        return ToResponse(ticket);
    }

    public async Task<TicketResponseDto> CreateAsync(CreateTicketDto dto, Guid currentUserId, UserRole currentUserRole, string currentUserName)
    {
        if (currentUserRole != UserRole.Client && currentUserRole != UserRole.Admin)
        {
            throw new UnauthorizedAccessException("Apenas clientes e administradores podem abrir chamados.");
        }

        await EnsureCategoryExists(dto.CategoryId);

        var ticket = new Ticket
        {
            Id = Guid.NewGuid(),
            Title = dto.Title.Trim(),
            Description = dto.Description.Trim(),
            Priority = ParsePriority(dto.Priority),
            Status = TicketStatus.Open,
            CategoryId = dto.CategoryId,
            ClientId = currentUserId,
            CreatedAt = DateTime.UtcNow
        };

        context.Tickets.Add(ticket);
        await context.SaveChangesAsync();

        await auditLogService.RegisterAsync(
            "TicketCreated",
            currentUserName,
            $"Chamado {ticket.Id} criado com prioridade {ticket.Priority}.");

        return await GetByIdAsync(ticket.Id, currentUserId, currentUserRole);
    }

    public async Task<TicketResponseDto> UpdateAsync(Guid id, UpdateTicketDto dto, Guid currentUserId, UserRole currentUserRole)
    {
        var ticket = await context.Tickets.FirstOrDefaultAsync(ticket => ticket.Id == id)
            ?? throw new KeyNotFoundException("Chamado nao encontrado.");

        EnsureCanEdit(ticket, currentUserId, currentUserRole);
        await EnsureCategoryExists(dto.CategoryId);

        ticket.Title = dto.Title.Trim();
        ticket.Description = dto.Description.Trim();
        ticket.Priority = ParsePriority(dto.Priority);
        ticket.CategoryId = dto.CategoryId;
        ticket.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();
        return await GetByIdAsync(ticket.Id, currentUserId, currentUserRole);
    }

    public async Task<TicketResponseDto> UpdateStatusAsync(
        Guid id,
        UpdateTicketStatusDto dto,
        Guid currentUserId,
        UserRole currentUserRole,
        string currentUserName)
    {
        var ticket = await context.Tickets.FirstOrDefaultAsync(ticket => ticket.Id == id)
            ?? throw new KeyNotFoundException("Chamado nao encontrado.");

        EnsureCanUpdateStatus(ticket, currentUserId, currentUserRole);

        var previousStatus = ticket.Status;
        var nextStatus = ParseStatus(dto.Status);

        ticket.Status = nextStatus;
        ticket.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();

        var action = nextStatus == TicketStatus.Closed ? "TicketClosed" : "TicketStatusUpdated";
        await auditLogService.RegisterAsync(
            action,
            currentUserName,
            $"Chamado {ticket.Id} alterado de {previousStatus} para {nextStatus}.");

        return await GetByIdAsync(ticket.Id, currentUserId, currentUserRole);
    }

    public async Task<TicketResponseDto> AssignAsync(Guid id, AssignTicketDto dto, Guid currentUserId, UserRole currentUserRole, string currentUserName)
    {
        var ticket = await context.Tickets.FirstOrDefaultAsync(ticket => ticket.Id == id)
            ?? throw new KeyNotFoundException("Chamado nao encontrado.");

        if (currentUserRole == UserRole.Technician)
        {
            if (ticket.TechnicianId is not null && ticket.TechnicianId != currentUserId)
            {
                throw new UnauthorizedAccessException("Este chamado ja foi atribuido a outro tecnico.");
            }

            ticket.TechnicianId = currentUserId;
        }
        else if (currentUserRole == UserRole.Admin)
        {
            var technicianId = dto.TechnicianId ?? currentUserId;
            var technicianExists = await context.Users.AnyAsync(user =>
                user.Id == technicianId && user.Role == UserRole.Technician && user.Active);

            if (!technicianExists)
            {
                throw new InvalidOperationException("Tecnico informado nao existe ou esta inativo.");
            }

            ticket.TechnicianId = technicianId;
        }
        else
        {
            throw new UnauthorizedAccessException("Clientes nao podem assumir chamados.");
        }

        ticket.Status = TicketStatus.InProgress;
        ticket.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();

        await auditLogService.RegisterAsync(
            "TicketAssigned",
            currentUserName,
            $"Chamado {ticket.Id} atribuido ao tecnico {ticket.TechnicianId}.");

        return await GetByIdAsync(ticket.Id, currentUserId, currentUserRole);
    }

    public async Task DeleteAsync(Guid id, Guid currentUserId, UserRole currentUserRole)
    {
        var ticket = await context.Tickets.FirstOrDefaultAsync(ticket => ticket.Id == id)
            ?? throw new KeyNotFoundException("Chamado nao encontrado.");

        if (currentUserRole != UserRole.Admin && ticket.ClientId != currentUserId)
        {
            throw new UnauthorizedAccessException("Voce nao tem permissao para excluir este chamado.");
        }

        context.Tickets.Remove(ticket);
        await context.SaveChangesAsync();
    }

    private IQueryable<Ticket> BaseQuery()
    {
        return context.Tickets
            .AsNoTracking()
            .Include(ticket => ticket.Category)
            .Include(ticket => ticket.Client)
            .Include(ticket => ticket.Technician);
    }

    private static TicketResponseDto ToResponse(Ticket ticket)
    {
        return new TicketResponseDto
        {
            Id = ticket.Id,
            Title = ticket.Title,
            Description = ticket.Description,
            Status = ticket.Status.ToString(),
            Priority = ticket.Priority.ToString(),
            CategoryId = ticket.CategoryId,
            CategoryName = ticket.Category?.Name ?? string.Empty,
            ClientId = ticket.ClientId,
            ClientName = ticket.Client?.Name ?? string.Empty,
            TechnicianId = ticket.TechnicianId,
            TechnicianName = ticket.Technician?.Name,
            CreatedAt = ticket.CreatedAt,
            UpdatedAt = ticket.UpdatedAt
        };
    }

    private async Task EnsureCategoryExists(Guid categoryId)
    {
        var exists = await context.Categories.AnyAsync(category => category.Id == categoryId);
        if (!exists)
        {
            throw new InvalidOperationException("Categoria informada nao existe.");
        }
    }

    private static void EnsureCanView(Ticket ticket, Guid currentUserId, UserRole currentUserRole)
    {
        if (currentUserRole == UserRole.Admin)
        {
            return;
        }

        if (currentUserRole == UserRole.Client && ticket.ClientId == currentUserId)
        {
            return;
        }

        if (currentUserRole == UserRole.Technician && (ticket.TechnicianId == currentUserId || ticket.TechnicianId is null))
        {
            return;
        }

        throw new UnauthorizedAccessException("Voce nao tem permissao para visualizar este chamado.");
    }

    private static void EnsureCanEdit(Ticket ticket, Guid currentUserId, UserRole currentUserRole)
    {
        if (currentUserRole == UserRole.Admin)
        {
            return;
        }

        if (currentUserRole == UserRole.Client && ticket.ClientId == currentUserId && ticket.Status != TicketStatus.Closed)
        {
            return;
        }

        throw new UnauthorizedAccessException("Voce nao tem permissao para editar este chamado.");
    }

    private static void EnsureCanUpdateStatus(Ticket ticket, Guid currentUserId, UserRole currentUserRole)
    {
        if (currentUserRole == UserRole.Admin)
        {
            return;
        }

        if (currentUserRole == UserRole.Technician && ticket.TechnicianId == currentUserId)
        {
            return;
        }

        throw new UnauthorizedAccessException("Voce nao tem permissao para alterar o status deste chamado.");
    }

    private static TicketStatus ParseStatus(string value)
    {
        var normalized = Normalize(value);

        return normalized switch
        {
            "aberto" or "open" => TicketStatus.Open,
            "emandamento" or "inprogress" => TicketStatus.InProgress,
            "aguardandocliente" or "waitingclient" => TicketStatus.WaitingClient,
            "resolvido" or "resolved" => TicketStatus.Resolved,
            "fechado" or "closed" => TicketStatus.Closed,
            _ => throw new InvalidOperationException("Status informado e invalido.")
        };
    }

    private static TicketPriority ParsePriority(string value)
    {
        var normalized = Normalize(value);

        return normalized switch
        {
            "baixa" or "low" => TicketPriority.Low,
            "media" or "medium" => TicketPriority.Medium,
            "alta" or "high" => TicketPriority.High,
            "critica" or "critical" => TicketPriority.Critical,
            _ => throw new InvalidOperationException("Prioridade informada e invalida.")
        };
    }

    private static string Normalize(string value)
    {
        return value.Trim()
            .ToLower()
            .Replace(" ", string.Empty)
            .Replace("é", "e")
            .Replace("í", "i")
            .Replace("á", "a")
            .Replace("ç", "c");
    }
}
