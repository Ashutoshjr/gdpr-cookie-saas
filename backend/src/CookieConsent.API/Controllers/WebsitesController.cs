using System.Security.Claims;
using CookieConsent.Application.DTOs;
using CookieConsent.Application.Interfaces;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace CookieConsent.API.Controllers;

[ApiController]
[Route("api/websites")]
[Authorize]
[EnableCors("AdminPolicy")]
public class WebsitesController : ControllerBase
{
    private readonly IWebsiteService _websiteService;
    private readonly IValidator<CreateWebsiteRequest> _createValidator;

    public WebsitesController(IWebsiteService websiteService, IValidator<CreateWebsiteRequest> createValidator)
    {
        _websiteService = websiteService;
        _createValidator = createValidator;
    }

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub")
        ?? throw new UnauthorizedAccessException();

    [HttpGet]
    public async Task<ActionResult<IEnumerable<WebsiteDto>>> GetAll()
    {
        var websites = await _websiteService.GetByUserAsync(UserId);
        return Ok(websites);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<WebsiteDto>> GetById(Guid id)
    {
        var website = await _websiteService.GetByIdAsync(id, UserId);
        return Ok(website);
    }

    [HttpPost]
    public async Task<ActionResult<WebsiteDto>> Create([FromBody] CreateWebsiteRequest request)
    {
        var validation = await _createValidator.ValidateAsync(request);
        if (!validation.IsValid)
            return BadRequest(new { status = 400, message = "Validation failed.", errors = validation.ToDictionary() });

        var website = await _websiteService.CreateAsync(request, UserId);
        return CreatedAtAction(nameof(GetById), new { id = website.Id }, website);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<WebsiteDto>> UpdateInfo(Guid id, [FromBody] UpdateWebsiteInfoRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Domain))
            return BadRequest(new { message = "Name and domain are required." });

        var website = await _websiteService.UpdateInfoAsync(id, UserId, request);
        return Ok(website);
    }

    [HttpPatch("{id:guid}/appearance")]
    public async Task<ActionResult<WebsiteDto>> UpdateAppearance(Guid id, [FromBody] UpdateBannerAppearanceRequest request)
    {
        var website = await _websiteService.UpdateAppearanceAsync(id, UserId, request);
        return Ok(website);
    }

    [HttpGet("{id:guid}/cookie-policy")]
    public async Task<ActionResult<string>> GetCookiePolicy(Guid id)
    {
        var html = await _websiteService.GenerateCookiePolicyAsync(id, UserId);
        return Ok(new { html });
    }

    [HttpPost("{id:guid}/regenerate-key")]
    public async Task<ActionResult<WebsiteDto>> RegenerateKey(Guid id)
    {
        var website = await _websiteService.RegenerateApiKeyAsync(id, UserId);
        return Ok(website);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _websiteService.DeleteAsync(id, UserId);
        return NoContent();
    }
}
