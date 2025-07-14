using Microsoft.AspNetCore.Mvc;
using ECommerceApi.Data;
using ECommerceApi.Models;

namespace ECommerceApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductsController(AppDbContext context)
        {
            _context = context;

            // Veritabanı boşsa örnek veriler ekle
            if (!_context.Products.Any())
            {
                _context.Products.AddRange(
                    new Product { Name = "T-Shirt", Price = 99.90m },
                    new Product { Name = "Sneakers", Price = 249.50m },
                    new Product { Name = "Laptop", Price = 8999.99m }
                );
                _context.SaveChanges();
            }
        }

        [HttpGet]
        public IActionResult Get()
        {
            return Ok(_context.Products.ToList());
        }

        // HTTP POST isteğiyle yeni ürün eklemek için bu metot kullanılır.
        // URL: POST /api/products
        [HttpPost]
        public IActionResult Post([FromBody] Product product)
        {


            // Geçerli veri varsa ürünü veritabanı bağlamına (EF Core) ekliyoruz.
            _context.Products.Add(product);

            // EF Core aracılığıyla değişiklikleri fiziksel veritabanına kaydediyoruz.
            _context.SaveChanges();

            // Başarılı şekilde oluşturulan veriyi geri döneriz.
            // 'CreatedAtAction' sayesinde 201 Created yanıtı ile birlikte, 
            // yeni ürünün URI'sini ve kendisini döneriz.
            return CreatedAtAction(nameof(Get), new { id = product.Id }, product);
        }

        // HTTP DELETE isteğiyle belirli bir ID'ye sahip ürünü silmek için kullanılır.
        // Örnek URL: DELETE /api/products/3
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            // Önce veritabanındaki ürünleri tarayıp, belirtilen ID'ye sahip olanı bulmaya çalışırız.
            var product = _context.Products.Find(id);

            // Eğer ürün bulunamazsa, kullanıcıya 404 Not Found hatası döneriz.
            if (product == null)
            {
                return NotFound($"ID'si {id} olan ürün bulunamadı.");
            }

            // Ürün bulunduysa, EF Core üzerinden veritabanından silinmek üzere işaretleriz.
            _context.Products.Remove(product);

            // Silme işlemini kalıcı hale getirmek için SaveChanges çağırılır.
            _context.SaveChanges();

            // 204 No Content → başarıyla silindi, ama gövde dönmeye gerek yok
            return NoContent();
        }

        // HTTP PUT isteğiyle mevcut bir ürünün bilgilerini güncellemek için kullanılır.
        // Örnek: PUT /api/products/2
        // Gövde (body): { "name": "Yeni Ürün Adı", "price": 1234.56 }
        [HttpPut("{id}")]
        public IActionResult Put(int id, [FromBody] Product updatedProduct)
        {
            // Önce veritabanında bu ID'ye sahip bir ürün olup olmadığını kontrol ederiz.
            var existingProduct = _context.Products.Find(id);

            // Ürün yoksa 404 Not Found döneriz.
            if (existingProduct == null)
            {
                return NotFound($"ID'si {id} olan ürün bulunamadı.");
            }


            // Veritabanındaki ürünün özelliklerini gelen veriyle güncelleriz.
            existingProduct.Name = updatedProduct.Name;
            existingProduct.Price = updatedProduct.Price;

            // Değişiklikleri veritabanına kaydederiz.
            _context.SaveChanges();

            // 200 OK ve güncellenmiş ürünle birlikte döneriz.
            return Ok(existingProduct);
        }



    }
}
