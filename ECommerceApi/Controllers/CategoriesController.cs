using Microsoft.AspNetCore.Mvc;
using ECommerceApi.Data;
using ECommerceApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace ECommerceApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CategoriesController(AppDbContext context)
        {
            _context = context;
        }

        // Tüm kategorileri getir (Herkes erişebilir)
        // İlişkili ürünleri de dahil et ve çıktıyı temizle
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _context.Categories
                                           .Include(c => c.Products) // İlişkili ürünleri dahil et
                                           .ToListAsync();

            // Anonim tip kullanarak çıktıyı istediğimiz gibi şekillendiriyoruz.
            // Her kategorinin içindeki ürünleri de anonim tip olarak alıyoruz,
            // böylece ürünlerin içinde tekrar kategori bilgisi oluşmuyor.
            var categoryResponses = categories.Select(c => new // <-- BURADA ANONİM TİP KULLANIYORUZ
            {
                c.Id,
                c.Name,
                Products = c.Products?.Select(p => new // Ürünleri de anonim tip olarak al
                {
                    p.Id,
                    p.Name,
                    p.Price,
                    p.Image
                    // Burada CategoryId veya Category navigation property'sini dahil etmiyoruz
                }).ToList()
            }).ToList();

            return Ok(categoryResponses);
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

            return NoContent();
        }
    }
}