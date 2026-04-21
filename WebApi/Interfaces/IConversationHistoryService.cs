using WebApi.Models;

namespace WebApi.Interfaces;

public interface IConversationHistoryService
{
    IReadOnlyList<ConversationTurn> GetRecentTurns(string topic, int maxTurns);

    void AddTurn(ConversationTurn turn);
}
