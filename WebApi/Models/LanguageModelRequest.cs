using System.ComponentModel.DataAnnotations;

namespace WebApi.Models;

public sealed class LanguageModelRequest
{
    [Required]
    public string Prompt { get; init; } = string.Empty;

    public string Topic { get; init; } = "general";

    public string? Instructions { get; init; }
}
