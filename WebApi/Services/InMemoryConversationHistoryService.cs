using System.Collections.Concurrent;
using WebApi.Interfaces;
using WebApi.Models;

namespace WebApi.Services;

public sealed class InMemoryConversationHistoryService : IConversationHistoryService
{
    private readonly ConcurrentDictionary<string, ConcurrentQueue<ConversationTurn>> _history = new();

    public IReadOnlyList<ConversationTurn> GetRecentTurns(string topic, int maxTurns)
    {
        var normalizedTopic = NormalizeTopic(topic);

        if (!_history.TryGetValue(normalizedTopic, out var turns))
        {
            return [];
        }

        return turns
            .ToArray()
            .OrderByDescending(turn => turn.CreatedUtc)
            .Take(maxTurns)
            .OrderBy(turn => turn.CreatedUtc)
            .ToArray();
    }

    public void AddTurn(ConversationTurn turn)
    {
        var normalizedTopic = NormalizeTopic(turn.Topic);
        var turns = _history.GetOrAdd(normalizedTopic, _ => new ConcurrentQueue<ConversationTurn>());

        turns.Enqueue(turn);

        while (turns.Count > 100)
        {
            turns.TryDequeue(out _);
        }
    }

    private static string NormalizeTopic(string topic)
    {
        return string.IsNullOrWhiteSpace(topic) ? "general" : topic.Trim().ToLowerInvariant();
    }
}
