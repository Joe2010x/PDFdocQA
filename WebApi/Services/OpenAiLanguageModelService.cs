using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Options;
using WebApi.Interfaces;
using WebApi.Models;

namespace WebApi.Services;

public sealed class OpenAiLanguageModelService(
    HttpClient httpClient,
    IOptions<OpenAiOptions> options,
    IConversationHistoryService conversationHistoryService,
    ILogger<OpenAiLanguageModelService> logger) : ILanguageModelService
{
    private readonly HttpClient _httpClient = httpClient;
    private readonly OpenAiOptions _options = options.Value;
    private readonly IConversationHistoryService _conversationHistoryService = conversationHistoryService;
    private readonly ILogger<OpenAiLanguageModelService> _logger = logger;

    public async Task<LanguageModelResponse> GenerateAnswerAsync(
        LanguageModelRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_options.OpenAIKey))
        {
            throw new InvalidOperationException("The OpenAIKey configuration value is missing.");
        }

        if (string.IsNullOrWhiteSpace(_options.ModelName))
        {
            throw new InvalidOperationException("The ModelName configuration value is missing.");
        }

        var topic = string.IsNullOrWhiteSpace(request.Topic) ? "general" : request.Topic.Trim();
        var history = _conversationHistoryService.GetRecentTurns(topic, 20);

        var payload = new
        {
            model = _options.ModelName,
            instructions = request.Instructions,
            input = BuildInput(history, request.Prompt)
        };

        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "responses")
        {
            Content = JsonContent.Create(payload)
        };

        httpRequest.Headers.Authorization =
            new AuthenticationHeaderValue("Bearer", _options.OpenAIKey);

        using var response = await _httpClient.SendAsync(httpRequest, cancellationToken);
        var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var providerMessage = TryGetErrorMessage(responseBody);
            var providerErrorCode = TryGetErrorCode(responseBody);

            _logger.LogWarning(
                "OpenAI request failed with status code {StatusCode}. Message: {Message} Code: {Code}",
                (int)response.StatusCode,
                providerMessage,
                providerErrorCode);

            throw new LanguageModelServiceException(
                providerMessage ??
                $"OpenAI request failed with status code {(int)response.StatusCode}.",
                response.StatusCode,
                providerErrorCode);
        }

        using var document = JsonDocument.Parse(responseBody);
        var root = document.RootElement;

        var content = TryGetOutputText(root);

        if (string.IsNullOrWhiteSpace(content))
        {
            throw new InvalidOperationException("OpenAI returned an empty response.");
        }

        var modelResponse = new LanguageModelResponse
        {
            Topic = topic,
            Model = _options.ModelName,
            Content = content,
            ResponseId = root.TryGetProperty("id", out var idElement)
                ? idElement.GetString()
                : null
        };

        _conversationHistoryService.AddTurn(new ConversationTurn
        {
            Topic = topic,
            Question = request.Prompt,
            Answer = modelResponse.Content,
            Model = modelResponse.Model,
            ResponseId = modelResponse.ResponseId
        });

        return modelResponse;
    }

    private static object[] BuildInput(
        IReadOnlyList<ConversationTurn> history,
        string currentPrompt)
    {
        var messages = new List<object>(history.Count * 2 + 1);

        foreach (var turn in history)
        {
            messages.Add(new
            {
                role = "user",
                content = turn.Question
            });

            messages.Add(new
            {
                role = "assistant",
                content = turn.Answer
            });
        }

        messages.Add(new
        {
            role = "user",
            content = currentPrompt
        });

        return messages.ToArray();
    }

    private static string? TryGetOutputText(JsonElement root)
    {
        if (root.TryGetProperty("output_text", out var outputTextElement))
        {
            return outputTextElement.GetString();
        }

        if (!root.TryGetProperty("output", out var outputElement) ||
            outputElement.ValueKind != JsonValueKind.Array)
        {
            return null;
        }

        foreach (var item in outputElement.EnumerateArray())
        {
            if (!item.TryGetProperty("content", out var contentElement) ||
                contentElement.ValueKind != JsonValueKind.Array)
            {
                continue;
            }

            foreach (var contentItem in contentElement.EnumerateArray())
            {
                if (!contentItem.TryGetProperty("text", out var textElement))
                {
                    continue;
                }

                var text = textElement.GetString();

                if (!string.IsNullOrWhiteSpace(text))
                {
                    return text;
                }
            }
        }

        return null;
    }

    private static string? TryGetErrorMessage(string responseBody)
    {
        try
        {
            using var document = JsonDocument.Parse(responseBody);
            var root = document.RootElement;

            if (!root.TryGetProperty("error", out var errorElement))
            {
                return null;
            }

            if (errorElement.TryGetProperty("message", out var messageElement))
            {
                return messageElement.GetString();
            }
        }
        catch (JsonException)
        {
            return null;
        }

        return null;
    }

    private static string? TryGetErrorCode(string responseBody)
    {
        try
        {
            using var document = JsonDocument.Parse(responseBody);
            var root = document.RootElement;

            if (!root.TryGetProperty("error", out var errorElement))
            {
                return null;
            }

            if (errorElement.TryGetProperty("code", out var codeElement))
            {
                return codeElement.GetString();
            }
        }
        catch (JsonException)
        {
            return null;
        }

        return null;
    }
}
