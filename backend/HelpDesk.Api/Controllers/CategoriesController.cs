using Asp.Versioning;
using HelpDesk.Api.Data;
using HelpDesk.Api.DTOs.Categories;
using HelpDesk.Api.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HelpDesk.Api.Controllers;

[ApiController]
[ApiVersion(1)]
[Authorize]
[Route("api/v{version:apiVersion}/categories")]
public class CategoriesController(AppDbContext context) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<CategoryDto>>>> GetAll()
    {
        var categories = await context.Categories
            .AsNoTracking()
            .OrderBy(category => category.Name)
            .Select(category => new CategoryDto
            {
                Id = category.Id,
                Name = category.Name
            })
            .ToListAsync();

        return Ok(ApiResponse<IReadOnlyList<CategoryDto>>.Ok(categories));
    }
}
