using Microsoft.EntityFrameworkCore;
using ECommerceApi.Data; // DbContext sınıfını bu klasöre yazacağız

var builder = WebApplication.CreateBuilder(args);

// 1️⃣ Veritabanı bağlantısı (SQLite)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));


// 2️⃣ Controller'ları aktif et
builder.Services.AddControllers();

// 3️⃣ Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 4️⃣ CORS politikası (React için gerekli!)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Swagger ve CORS
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthorization();

// Controller route'larını aktif et
app.MapControllers();

app.Run();
