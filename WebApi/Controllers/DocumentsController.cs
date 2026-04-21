using Microsoft.AspNetCore.Mvc;
using WebApi.Interfaces;
using WebApi.Models;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DocumentsController(ILanguageModelService languageModelService) : ControllerBase
{
    private readonly ILanguageModelService _languageModelService = languageModelService;

    [HttpGet("status")]
    public IActionResult GetStatus()
    {
        var response = new
        {
            application = "PDF Document Q&A API",
            status = "Online",
            features = new[]
            {
                "Upload PDF documents",
                "Extract document text",
                "Ask questions over indexed content"
            },
            serverTimeUtc = DateTime.UtcNow
        };

        return Ok(response);
    }

    [HttpPost("ask")]
    public async Task<IActionResult> AskQuestion(
        [FromBody] LanguageModelRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var response = await _languageModelService.GenerateAnswerAsync(request, cancellationToken);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return Problem(detail: ex.Message, statusCode: StatusCodes.Status500InternalServerError);
        }
        catch (LanguageModelServiceException ex)
        {
            return Problem(
                detail: ex.Message,
                statusCode: (int)ex.StatusCode,
                title: "Language model request failed");
        }
    }
}
