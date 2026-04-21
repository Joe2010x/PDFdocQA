using System.Net;

namespace WebApi.Models;

public sealed class LanguageModelServiceException : Exception
{
    public LanguageModelServiceException(
        string message,
        HttpStatusCode statusCode,
        string? providerErrorCode = null) : base(message)
    {
        StatusCode = statusCode;
        ProviderErrorCode = providerErrorCode;
    }

    public HttpStatusCode StatusCode { get; }

    public string? ProviderErrorCode { get; }
}
