using HelpDesk.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HelpDesk.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Ticket> Tickets => Set<Ticket>();
    public DbSet<TicketMessage> TicketMessages => Set<TicketMessage>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(user => user.Id);
            entity.HasIndex(user => user.Email).IsUnique();
            entity.Property(user => user.Name).HasMaxLength(120).IsRequired();
            entity.Property(user => user.Email).HasMaxLength(180).IsRequired();
            entity.Property(user => user.PasswordHash).HasMaxLength(500).IsRequired();
            entity.Property(user => user.Role).HasConversion<string>().HasMaxLength(30).IsRequired();
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(category => category.Id);
            entity.HasIndex(category => category.Name).IsUnique();
            entity.Property(category => category.Name).HasMaxLength(80).IsRequired();
        });

        modelBuilder.Entity<Ticket>(entity =>
        {
            entity.HasKey(ticket => ticket.Id);
            entity.Property(ticket => ticket.Title).HasMaxLength(160).IsRequired();
            entity.Property(ticket => ticket.Description).HasMaxLength(4000).IsRequired();
            entity.Property(ticket => ticket.Status).HasConversion<string>().HasMaxLength(40).IsRequired();
            entity.Property(ticket => ticket.Priority).HasConversion<string>().HasMaxLength(40).IsRequired();

            entity.HasOne(ticket => ticket.Category)
                .WithMany(category => category.Tickets)
                .HasForeignKey(ticket => ticket.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(ticket => ticket.Client)
                .WithMany(user => user.ClientTickets)
                .HasForeignKey(ticket => ticket.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(ticket => ticket.Technician)
                .WithMany(user => user.TechnicianTickets)
                .HasForeignKey(ticket => ticket.TechnicianId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<TicketMessage>(entity =>
        {
            entity.HasKey(message => message.Id);
            entity.Property(message => message.Message).HasMaxLength(4000).IsRequired();

            entity.HasOne(message => message.Ticket)
                .WithMany(ticket => ticket.Messages)
                .HasForeignKey(message => message.TicketId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(message => message.User)
                .WithMany(user => user.Messages)
                .HasForeignKey(message => message.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasKey(log => log.Id);
            entity.Property(log => log.Action).HasMaxLength(80).IsRequired();
            entity.Property(log => log.UserName).HasMaxLength(120).IsRequired();
            entity.Property(log => log.Description).HasMaxLength(1000).IsRequired();
        });

        SeedData.Configure(modelBuilder);
    }
}
