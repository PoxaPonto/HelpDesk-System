using System.Net;
using System.Text.Json;
using HelpDesk.Api.Responses;

namespace HelpDesk.Api.Middlewares;

public class ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception while processing request.");
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = ex switch
            {
                UnauthorizedAccessException => (int)HttpStatusCode.Unauthorized,
                KeyNotFoundException => (int)HttpStatusCode.NotFound,
                InvalidOperationException => (int)HttpStatusCode.BadRequest,
                _ => (int)HttpStatusCode.InternalServerError
            };

            var message = context.Response.StatusCode == (int)HttpStatusCode.InternalServerError
                ? "Ocorreu um erro inesperado. Tente novamente mais tarde."
                : ex.Message;

            var response = ApiResponse<object>.Fail(message);
            await context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }
    }
}
