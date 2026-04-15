using System.Net;
using System.Text.Json;
using CookieConsent.Application.Exceptions;
using FluentValidation;

namespace CookieConsent.API.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, message, errors) = exception switch
        {
            NotFoundException e => (HttpStatusCode.NotFound, e.Message, (Dictionary<string, string[]>?)null),
            ForbiddenException e => (HttpStatusCode.Forbidden, e.Message, null),
            UnauthorizedException e => (HttpStatusCode.Unauthorized, e.Message, null),
            InvalidOperationException e => (HttpStatusCode.BadRequest, e.Message, null),
            ValidationException e => (
                HttpStatusCode.BadRequest,
                "Validation failed.",
                e.Errors.GroupBy(x => x.PropertyName)
                         .ToDictionary(g => g.Key, g => g.Select(x => x.ErrorMessage).ToArray())
            ),
            _ => (HttpStatusCode.InternalServerError, "An unexpected error occurred.", null)
        };

        if (statusCode == HttpStatusCode.InternalServerError)
            _logger.LogError(exception, "Unhandled exception");

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var response = new
        {
            status = (int)statusCode,
            message,
            errors
        };

        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        await context.Response.WriteAsync(json);
    }
}
