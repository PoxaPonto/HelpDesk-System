namespace HelpDesk.Api.DTOs.Users;

public class UserQueryDto
{
    public string? Search { get; set; }
    public string? Role { get; set; }
    public bool? Active { get; set; }
}
