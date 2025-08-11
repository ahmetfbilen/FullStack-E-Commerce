using Microsoft.AspNetCore.Mvc;
using ECommerceApi.Data;
using ECommerceApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore; // Include ve ToListAsync için
using System.Security.Claims; // 🔹 claims için

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
        public async Task<IActionResult> Get( // async Task<IActionResult> olmalı
            [FromQuery] string? q,             // 🔹 arama metni (opsiyonel)
            [FromQuery] int? categoryId,       // 🔹 kategori filtresi (opsiyonel)
            [FromQuery] int? sellerId          // 🔹 satıcı filtresi (opsiyonel)
        )
        {
            // 🔹 Filtrelenebilir sorgu oluştur (Include + AsQueryable)
            var query = _context.Products
                .Include(p => p.Category)
                .AsQueryable();

            // 🔹 Arama filtresi (adı veya istersen açıklama)
            if (!string.IsNullOrWhiteSpace(q))
            {
                query = query.Where(p =>
                    p.Name.Contains(q)            // ürün adı
                /* || p.Description!.Contains(q) */ // açıklama alanın varsa aç
                );
            }

            // 🔹 Kategori filtresi
            if (categoryId.HasValue)
            {
                query = query.Where(p => p.CategoryId == categoryId.Value);
            }

            // 🔹 Satıcı filtresi (belirli bir kullanıcının ekledikleri)
            if (sellerId.HasValue)
            {
                query = query.Where(p => p.SellerId == sellerId.Value);
            }

            // await kullanmak zorunludur çünkü ToListAsync asenkron bir metottur.
            var products = await query.ToListAsync();

            // Anonim tip kullanarak çıktıyı istediğimiz gibi şekillendiriyoruz.
            // Category içindeki Products koleksiyonunu dahil etmiyoruz.
            var productResponses = products.Select(p => new // <-- BURADA ANONİM TİP KULLANIYORUZ
            {
                p.Id,
                p.Name,
                p.Price,
                p.Image,
                p.CategoryId,
                p.SellerId, // 🔹 frontende bilgi gitsin
                Category = p.Category != null ? new // Kategori varsa sadece ID ve Name'i al
                {
                    p.Category.Id,
                    p.Category.Name
                } : null // Kategori yoksa null
            }).ToList();

            return Ok(productResponses);
        }

        // 🔹 Sadece giriş yapan satıcının kendi ürünleri
        [Authorize(Roles = "Admin,Seller")]
        [HttpGet("mine")]
        public async Task<IActionResult> GetMine()
        {
            var currentUserId = GetUserIdFromClaims(); // 🔹
            if (currentUserId == null) return Forbid();

            var products = await _context.Products
                .Include(p => p.Category)
                .Where(p => p.SellerId == currentUserId)
                .ToListAsync();

            var result = products.Select(p => new
            {
                p.Id,
                p.Name,
                p.Price,
                p.Image,
                p.CategoryId,
                p.SellerId,
                Category = p.Category != null ? new { p.Category.Id, p.Category.Name } : null
            });

            return Ok(result);
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

            // 🔹 Ürünü ekleyen kullanıcıyı otomatik ata (JWT claim'den)
            var currentUserId = GetUserIdFromClaims();
            if (currentUserId != null)
            {
                product.SellerId = currentUserId;
            }
            // Eğer claim yoksa (ör. AllowAnonymous ise) frontend SellerId gönderebilir;
            // ama güvenlik için claim'le atamak tercih edilir.

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
                product.SellerId, // 🔹
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

            // 🔹 İstersen burada da güvenlik için sadece sahibi güncelleyebilsin kontrolü yapılabilir:
            // var currentUserId = GetUserIdFromClaims();
            // if (User.IsInRole("Seller") && existingProduct.SellerId != currentUserId) return Forbid();

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
                existingProduct.SellerId, // 🔹
                Category = existingProduct.Category != null ? new
                {
                    existingProduct.Category.Id,
                    existingProduct.Category.Name
                } : null
            };

            return Ok(productResponse);
        }

        // 🔹 Küçük yardımcı: JWT içinden user id çek
        private int? GetUserIdFromClaims()
        {
            // Genelde ClaimTypes.NameIdentifier ya da "sub" kullanılır
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
            if (idClaim == null) return null;
            return int.TryParse(idClaim.Value, out var id) ? id : null;
        }
        // JWT ile giriş yapan kullanıcının kimliği (User nesnesindeki claim’ler) backend’de mevcut.

        // Bu yardımcı metot, o claim’lerden user id’yi alıp SellerId alanına yazar.

        // Böylece kullanıcı kendi kimliğini değiştiremez, güvenli olur.

        // Ama daha basit ve güvenliği ikinci plana atan bir yöntem istersen:

        // POST /api/products’ta frontend’ten SellerId alanını da JSON ile gönderebilirsin.

        // O zaman bu yardımcı metoda gerek kalmaz, sadece product.SellerId = gelenVeri yaparsın.

        // Fakat bu durumda herhangi biri API’ye başka bir SellerId gönderip o kişi adına ürün ekleyebilir.
    }
}
