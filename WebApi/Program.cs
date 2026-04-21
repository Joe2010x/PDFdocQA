using WebApi.Interfaces;
using WebApi.Models;
using WebApi.Services;

var builder = WebApplication.CreateBuilder(args);

const string AllowClientAppPolicy = "AllowClientApp";

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.Configure<OpenAiOptions>(builder.Configuration);
builder.Services.AddSingleton<IConversationHistoryService, InMemoryConversationHistoryService>();
builder.Services.AddCors(options =>
{
    options.AddPolicy(AllowClientAppPolicy, policy =>
    {
        policy.WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpClient<ILanguageModelService, OpenAiLanguageModelService>(client =>
{
    client.BaseAddress = new Uri("https://api.openai.com/v1/");
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(AllowClientAppPolicy);

app.UseAuthorization();

app.MapControllers();

app.Run();
