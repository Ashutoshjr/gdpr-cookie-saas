using System.Security.Claims;
using CookieConsent.Application.DTOs;
using CookieConsent.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace CookieConsent.API.Controllers;

[ApiController]
[Route("api/analytics")]
[Authorize]
[EnableCors("AdminPolicy")]
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _analyticsService;

    public AnalyticsController(IAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub")
        ?? throw new UnauthorizedAccessException();

    /// <summary>Total consents, accept/reject rates, this-month count</summary>
    [HttpGet("summary")]
    public async Task<ActionResult<ConsentSummaryDto>> GetSummary([FromQuery] Guid websiteId)
    {
        var result = await _analyticsService.GetSummaryAsync(websiteId, UserId);
        return Ok(result);
    }

    /// <summary>Daily consent counts for trend chart (last N days)</summary>
    [HttpGet("trend")]
    public async Task<ActionResult<IEnumerable<DailyConsentDto>>> GetTrend(
        [FromQuery] Guid websiteId,
        [FromQuery] int days = 30)
    {
        if (days < 7 || days > 365) days = 30;
        var result = await _analyticsService.GetTrendAsync(websiteId, UserId, days);
        return Ok(result);
    }

    /// <summary>Per-category acceptance rates</summary>
    [HttpGet("categories")]
    public async Task<ActionResult<IEnumerable<CategoryRateDto>>> GetCategoryRates([FromQuery] Guid websiteId)
    {
        var result = await _analyticsService.GetCategoryRatesAsync(websiteId, UserId);
        return Ok(result);
    }
}
