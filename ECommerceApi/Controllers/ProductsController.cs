using Microsoft.AspNetCore.Mvc;
using ECommerceApi.Data;
using ECommerceApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore; // Include ve ToListAsync için

namespace ECommerceApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]//Tüm ProductsController endpoint'leri için yetkilendirme gerektirir
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductsController(AppDbContext context)
        {
            _context = context;
        }

        // [AllowAnonymous] eklersen herkes tarafından erişilebilir olur
        [AllowAnonymous]
        [HttpGet]
        // Ürünleri getirirken kategorilerini de dahil et ve çıktıyı temizle
        public async Task<IActionResult> Get() // async Task<IActionResult> olmalı
        {
            // await kullanmak zorunludur çünkü ToListAsync asenkron bir metottur.
            var products = await _context.Products.Include(p => p.Category).ToListAsync();

            // Anonim tip kullanarak çıktıyı istediğimiz gibi şekillendiriyoruz.
            // Category içindeki Products koleksiyonunu dahil etmiyoruz.
            var productResponses = products.Select(p => new // <-- BURADA ANONİM TİP KULLANIYORUZ
            {
                p.Id,
                p.Name,
                p.Price,
                p.Image,
                p.CategoryId,
                Category = p.Category != null ? new // Kategori varsa sadece ID ve Name'i al
                {
                    p.Category.Id,
                    p.Category.Name
                } : null // Kategori yoksa null
            }).ToList();

            return Ok(productResponses);
        }

        // HTTP POST isteğiyle yeni ürün eklemek için bu metot kullanılır.
        // URL: POST /api/products
        //[Authorize(Roles = "Admin,Seller")] // Eğer rol tabanlı yetkilendirme isterseniz bu satırı aktif edin
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] Product product) // async Task<IActionResult> olmalı
        {
            // Kategori ID'sinin geçerli bir kategoriye ait olup olmadığını kontrol et
            // await kullanmak zorunludur çünkü AnyAsync asenkron bir metottur.
            if (!await _context.Categories.AnyAsync(c => c.Id == product.CategoryId))
            {
                return BadRequest("Geçersiz Kategori ID'si.");
            }

            _context.Products.Add(product);
            // await kullanmak zorunludur çünkü SaveChangesAsync asenkron bir metottur.
            await _context.SaveChangesAsync();

            // Yeni eklenen ürünü, ilişkili kategori bilgisiyle birlikte döndür
            // await kullanmak zorunludur çünkü LoadAsync asenkron bir metottur.
            await _context.Entry(product).Reference(p => p.Category).LoadAsync();

            // Başarılı şekilde oluşturulan veriyi geri döneriz.
            // 'CreatedAtAction' sayesinde 201 Created yanıtı ile birlikte,
            // yeni ürünün URI'sini ve kendisini döneriz.
            // Eklenen ürünün yanıtını da temiz bir anonim tip olarak döndür
            var productResponse = new // <-- BURADA ANONİM TİP KULLANIYORUZ
            {
                product.Id,
                product.Name,
                product.Price,
                product.Image,
                product.CategoryId,
                Category = product.Category != null ? new
                {
                    product.Category.Id,
                    product.Category.Name
                } : null
            };

            return CreatedAtAction(nameof(Get), new { id = product.Id }, productResponse);
        }

        // HTTP DELETE isteğiyle belirli bir ID'ye sahip ürünü silmek için kullanılır.
        // Örnek URL: DELETE /api/products/3
        [Authorize(Roles = "Admin,Seller")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id) // async Task<IActionResult> olmalı
        {
            // Önce veritabanındaki ürünleri tarayıp, belirtilen ID'ye sahip olanı bulmaya çalışırız.
            // await kullanmak zorunludur çünkü FindAsync asenkron bir metottur.
            var product = await _context.Products.FindAsync(id);

            // Eğer ürün bulunamazsa, kullanıcıya 404 Not Found hatası döner
            if (product == null)
            {
                return NotFound($"ID'si {id} olan ürün bulunmadı.");
            }

            // Ürün bulunduysa, EF Core üzerinden veritabanından silinmek üzere işaretler
            _context.Products.Remove(product);

            // await kullanmak zorunludur çünkü SaveChangesAsync asenkron bir metottur.
            await _context.SaveChangesAsync();

            // 204 No Content → başarıyla silindi, ama gövde dönmeye gerek yok
            return NoContent();
        }

        // HTTP PUT isteğiyle mevcut bir ürünün bilgilerini güncellemek için kullan
        // Örnek: PUT /api/products/2
        // Gövde (body): { "name": "Yeni Ürün Adı", "price": 1234.56 }
        [Authorize(Roles = "Admin,Seller")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] Product updatedProduct) // async Task<IActionResult> olmalı
        {
            //[FromBody] bir HTTP isteğinin gövdesindeki veriyi C# nesnelerinize otomatik olarak dönüştürmek için kullanılan
            // Önce veritabanında bu ID'ye sahip bir ürün olup olmadığını kontrol eder
            // await kullanmak zorunludur çünkü FindAsync asenkron bir metottur.
            var existingProduct = await _context.Products.FindAsync(id);

            if (existingProduct == null)
            {
                return NotFound($"ID'si {id} olan ürün bulunamadı.");
            }

            // Kategori ID'sinin geçerli bir kategoriye ait olup olmadığını kontrol et
            // await kullanmak zorunludur çünkü AnyAsync asenkron bir metottur.
            if (!await _context.Categories.AnyAsync(c => c.Id == updatedProduct.CategoryId))
            {
                return BadRequest("Geçersiz Kategori ID'si.");
            }

            // Veritabanındaki ürünün özelliklerini gelen veriyle güncelle
            existingProduct.Name = updatedProduct.Name;
            existingProduct.Price = updatedProduct.Price;
            existingProduct.Image = updatedProduct.Image;
            existingProduct.CategoryId = updatedProduct.CategoryId; // CategoryId'yi güncelle

            // await kullanmak zorunludur çünkü SaveChangesAsync asenkron bir metottur.
            await _context.SaveChangesAsync();

            // Güncellenen ürünü, ilişkili kategori bilgisiyle birlikte döndür
            // await kullanmak zorunludur çünkü LoadAsync asenkron bir metottur.
            await _context.Entry(existingProduct).Reference(p => p.Category).LoadAsync();

            // 200 OK ve güncellenmiş ürünle birlikte dönüyo
            // Güncellenen ürünün yanıtını da temiz bir anonim tip olarak döndür
            var productResponse = new // <-- BURADA ANONİM TİP KULLANIYORUZ
            {
                existingProduct.Id,
                existingProduct.Name,
                existingProduct.Price,
                existingProduct.Image,
                existingProduct.CategoryId,
                Category = existingProduct.Category != null ? new
                {
                    existingProduct.Category.Id,
                    existingProduct.Category.Name
                } : null
            };

            return Ok(productResponse);
        }
    }
}