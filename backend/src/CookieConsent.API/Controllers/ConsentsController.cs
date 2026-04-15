using System.Security.Claims;
using CookieConsent.Application.DTOs;
using CookieConsent.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace CookieConsent.API.Controllers;

[ApiController]
[Route("api/consents")]
[Authorize]
[EnableCors("AdminPolicy")]
public class ConsentsController : ControllerBase
{
    private readonly IConsentService _consentService;

    public ConsentsController(IConsentService consentService) => _consentService = consentService;

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub")
        ?? throw new UnauthorizedAccessException();

    [HttpGet]
    public async Task<ActionResult<PagedResult<ConsentDto>>> GetPaged(
        [FromQuery] Guid websiteId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 20;

        var result = await _consentService.GetPagedAsync(websiteId, UserId, page, pageSize);
        return Ok(result);
    }
}
