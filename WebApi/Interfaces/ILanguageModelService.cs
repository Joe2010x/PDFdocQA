using WebApi.Models;

namespace WebApi.Interfaces;

public interface ILanguageModelService
{
    Task<LanguageModelResponse> GenerateAnswerAsync(
        LanguageModelRequest request,
        CancellationToken cancellationToken = default);
}
