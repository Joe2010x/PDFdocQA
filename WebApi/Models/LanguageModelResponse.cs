namespace WebApi.Models;

public sealed class LanguageModelResponse
{
    public string Topic { get; init; } = string.Empty;

    public string Model { get; init; } = string.Empty;

    public string Content { get; init; } = string.Empty;

    public string? ResponseId { get; init; }
}
