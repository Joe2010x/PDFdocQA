namespace WebApi.Models;

public sealed class OpenAiOptions
{
    public string OpenAIKey { get; init; } = string.Empty;

    public string ModelName { get; init; } = string.Empty;
}
