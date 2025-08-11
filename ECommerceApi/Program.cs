using Microsoft.EntityFrameworkCore;
using ECommerceApi.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.IdentityModel.JsonWebTokens;
using System.Security.Claims;
using System.Text.Json.Serialization; // sonsuz döngüyü kırmak için
using Microsoft.OpenApi.Models; // Swagger için gerekli (eğer kullanıyorsanız)
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

// SADECE BU TEK AddControllers() ÇAĞRISI OLMALI VE JSON AYARLARI BURADA ZİNCİRLENMELİ
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.WriteIndented = true;
    });

// Swagger/OpenAPI servislerini ekle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(option => // Swagger'ı JWT ile yapılandırmak isterseniz bu kısmı kullanın
{
    // Eğer Swagger'da Authorize butonu istiyorsanız bu kısmı aktif edin
    // option.SwaggerDoc("v1", new OpenApiInfo { Title = "ECommerce API", Version = "v1" });
    // option.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    // {
    //     In = ParameterLocation.Header,
    //     Description = "Lütfen geçerli bir token girin",
    //     Name = "Authorization",
    //     Type = SecuritySchemeType.Http,
    //     BearerFormat = "JWT",
    //     Scheme = "Bearer"
    // });
    // option.AddSecurityRequirement(new OpenApiSecurityRequirement
    // {
    //     {
    //         new OpenApiSecurityScheme
    //         {
    //             Reference = new OpenApiReference
    //             {
    //                 Type=ReferenceType.SecurityScheme,
    //                 Id="Bearer"
    //             }
    //         },
    //         new string[]{}
    //     }
    // });
});


// CORS politikası (React için gerekli!)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        // React uygulamanızın çalıştığı tam URL'yi belirtin
        // React uygulamanız genellikle http://localhost:5173/ adresinde çalışır
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Kimlik bilgileri (token) içeren istekler için bu önemli
    });
});
builder.Services.AddSingleton(new RedisService("localhost:6379"));

var app = builder.Build();

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
app.UseCors("AllowAll"); // CORS middleware'i UseAuthentication'dan önce gelmeli

// Kimlik doğrulama middleware'ini yetkilendirmeden önce ekleyin
app.UseAuthentication();
app.UseAuthorization();

// Controller route'larını aktif et
app.MapControllers();

app.Run();