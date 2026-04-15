using CookieConsent.Application.DTOs;
using CookieConsent.Application.Interfaces;
using FluentValidation;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace CookieConsent.API.Controllers;

[ApiController]
[Route("api")]
[EnableCors("PublicPolicy")]
public class PublicController : ControllerBase
{
    private readonly IConfigService _configService;
    private readonly IConsentService _consentService;
    private readonly IValidator<ConsentRequest> _consentValidator;

    public PublicController(
        IConfigService configService,
        IConsentService consentService,
        IValidator<ConsentRequest> consentValidator)
    {
        _configService = configService;
        _consentService = consentService;
        _consentValidator = consentValidator;
    }

    [HttpGet("config/{apiKey:guid}")]
    public async Task<ActionResult<ConfigResponse>> GetConfig(Guid apiKey)
    {
        var config = await _configService.GetConfigAsync(apiKey);
        return Ok(config);
    }

    [HttpPost("consent")]
    public async Task<ActionResult<ConsentDto>> RecordConsent([FromBody] ConsentRequest request)
    {
        var validation = await _consentValidator.ValidateAsync(request);
        if (!validation.IsValid)
            return BadRequest(new { status = 400, message = "Validation failed.", errors = validation.ToDictionary() });

        var ipAddress = HttpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault()
            ?? HttpContext.Connection.RemoteIpAddress?.ToString()
            ?? "unknown";

        var userAgent = HttpContext.Request.Headers["User-Agent"].FirstOrDefault() ?? string.Empty;

        var result = await _consentService.RecordAsync(request, ipAddress, userAgent);
        return Ok(result);
    }
}
