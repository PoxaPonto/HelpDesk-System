using Asp.Versioning;
using HelpDesk.Api.DTOs.Users;
using HelpDesk.Api.Responses;
using HelpDesk.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HelpDesk.Api.Controllers;

[ApiController]
[ApiVersion(1)]
[Authorize(Roles = "Admin")]
[Route("api/v{version:apiVersion}/users")]
public class UsersController(IUserService userService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<UserResponseDto>>>> GetAll([FromQuery] UserQueryDto query)
    {
        var users = await userService.GetAllAsync(query);
        return Ok(ApiResponse<IReadOnlyList<UserResponseDto>>.Ok(users));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<UserResponseDto>>> Create(CreateUserDto dto)
    {
        var user = await userService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = user.Id, version = "1" }, ApiResponse<UserResponseDto>.Ok(user, "Usuario criado com sucesso."));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<UserResponseDto>>> GetById(Guid id)
    {
        var user = await userService.GetByIdAsync(id);
        return Ok(ApiResponse<UserResponseDto>.Ok(user));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<UserResponseDto>>> Update(Guid id, UpdateUserDto dto)
    {
        var user = await userService.UpdateAsync(id, dto);
        return Ok(ApiResponse<UserResponseDto>.Ok(user, "Usuario atualizado com sucesso."));
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        await userService.DeleteAsync(id);
        return Ok(ApiResponse<object>.Ok(new { }, "Usuario desativado com sucesso."));
    }
}
