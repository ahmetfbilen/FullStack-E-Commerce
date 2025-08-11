using Microsoft.AspNetCore.Mvc;
using ECommerceApi.Data;
using ECommerceApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using ECommerceApi.Services; // RedisService için
using Newtonsoft.Json; // JSON serialize/deserialize için

namespace ECommerceApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly RedisService _redis; // Redis servisi

        public CategoriesController(AppDbContext context, RedisService redis)
        {
            _context = context;
            _redis = redis;
        }

        // Tüm kategorileri getir (Herkes erişebilir)
        // İlişkili ürünleri de dahil et ve çıktıyı temizle
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetCategories()
        {
            string cacheKey = "categories";

            var cachedData = await _redis.Database.StringGetAsync(cacheKey);
            if (!string.IsNullOrEmpty(cachedData))
            {
                var categoriesFromCache = JsonConvert.DeserializeObject<List<CategoryDto>>(cachedData);
                return Ok(new { source = "redis", data = categoriesFromCache });
            }

            var categories = await _context.Categories
                                           .Include(c => c.Products)
                                           .ToListAsync();

            var categoryResponses = categories.Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Products = c.Products?.Select(p => new ProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Price = p.Price,
                    Image = p.Image
                }).ToList()
            }).ToList();

            await _redis.Database.StringSetAsync(
                cacheKey,
                JsonConvert.SerializeObject(categoryResponses),
                TimeSpan.FromHours(1)
            );

            return Ok(new { source = "database", data = categoryResponses });
        }

        // DTO sınıfları
        public class CategoryDto
        {
            public int Id { get; set; }
            public string Name { get; set; }
            public List<ProductDto> Products { get; set; }
        }

        public class ProductDto
        {
            public int Id { get; set; }
            public string Name { get; set; }
            public decimal Price { get; set; }
            public string Image { get; set; }
        }

        // Belirli bir kategoriyi ID'ye göre getir (Herkes erişebilir)
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);

            if (category == null)
            {
                return NotFound();
            }

            // Tek bir kategori döndürürken de anonim tip kullanmak tutarlılık sağlar
            var categoryResponse = new // <-- BURADA ANONİM TİP KULLANIYORUZ
            {
                category.Id,
                category.Name
            };

            return Ok(categoryResponse);
        }

        // Yeni kategori ekle (Sadece Admin rolündekiler)
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddCategory([FromBody] Category category)
        {
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            // Yeni kategori eklendiğinde Redis cache'i temizliyoruz
            await _redis.Database.KeyDeleteAsync("categories");

            // Eklenen kategoriyi anonim tip olarak döndür
            var categoryResponse = new // <-- BURADA ANONİM TİP KULLANIYORUZ
            {
                category.Id,
                category.Name
            };

            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, categoryResponse);
        }

        // Kategoriyi güncelle (Sadece Admin rolündekiler)
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] Category updatedCategory)
        {
            var existingCategory = await _context.Categories.FindAsync(id);

            if (existingCategory == null)
            {
                return NotFound($"ID'si {id} olan kategori bulunamadı.");
            }

            existingCategory.Name = updatedCategory.Name;

            await _context.SaveChangesAsync();

            // Güncelleme sonrası cache'i temizliyoruz
            await _redis.Database.KeyDeleteAsync("categories");

            return NoContent();
        }

        // Kategoriyi sil (Sadece Admin rolündekiler)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                return NotFound($"ID'si {id} olan kategori bulunamadı.");
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            // Silme sonrası cache'i temizliyoruz
            await _redis.Database.KeyDeleteAsync("categories");

            return NoContent();
        }
    }
}