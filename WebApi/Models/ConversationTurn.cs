namespace WebApi.Models;

public sealed class ConversationTurn
{
    public string Topic { get; init; } = string.Empty;

    public string Question { get; init; } = string.Empty;

    public string Answer { get; init; } = string.Empty;

    public string Model { get; init; } = string.Empty;

    public string? ResponseId { get; init; }

    public DateTime CreatedUtc { get; init; } = DateTime.UtcNow;
}
