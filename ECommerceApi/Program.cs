using Microsoft.EntityFrameworkCore;
using ECommerceApi.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using System.Text.Json.Serialization;
using Microsoft.OpenApi.Models;
using ECommerceApi.Services;

var builder = WebApplication.CreateBuilder(args);

// JWT Ayarlarını yapılandırmadan okuyun
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["Secret"];
var issuer = jwtSettings["Issuer"];
var audience = jwtSettings["Audience"];

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// JWT Kimlik Doğrulama Servisini Ekle
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        ValidIssuer = issuer,
        ValidAudience = audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };

    options.MapInboundClaims = false;
    options.TokenValidationParameters.RoleClaimType = ClaimTypes.Role;
});

// JSON döngü hatalarını önlemek için ayar
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.WriteIndented = true;
    });

// Swagger/OpenAPI servislerini ekle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS politikası (React için gerekli!)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        // React uygulamanızın çalıştığı portu buraya yazın
        policy.WithOrigins("http://localhost:5173") // React default port
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Redis servisi
builder.Services.AddSingleton(new RedisService("localhost:6379"));

// Ollama API çağrıları için HttpClient
builder.Services.AddHttpClient();

var app = builder.Build();

// Seed işlemi
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    DataSeeder.SeedUsers(context);
}

// Swagger ve CORS
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// CORS middleware'i
app.UseCors("AllowReactApp");

// Kimlik doğrulama ve yetkilendirme
app.UseAuthentication();
app.UseAuthorization();

// Controller route'larını aktif et
app.MapControllers();

app.Run();