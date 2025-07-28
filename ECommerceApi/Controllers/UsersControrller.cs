using Microsoft.AspNetCore.Mvc;
using ECommerceApi.Data;
using ECommerceApi.Models;

namespace ECommerceApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;



        }

        [HttpGet]
        public IActionResult Get()
        {
            return Ok(_context.Users.ToList());
        }

        // HTTP POST isteğiyle yeni ürün eklemek için bu metot kullanılır.
        // URL: POST /api/products
        [HttpPost]
        public IActionResult Post([FromBody] User user)
        {


            // Geçerli veri varsa ürünü veritabanı bağlamına (EF Core) ekliyoruz.
            _context.Users.Add(user);

            // EF Core aracılığıyla değişiklikleri fiziksel veritabanına kaydediyoruz.
            _context.SaveChanges();

            // Başarılı şekilde oluşturulan veriyi geri döneriz.
            // 'CreatedAtAction' sayesinde 201 Created yanıtı ile birlikte, 
            // yeni ürünün URI'sini ve kendisini döneriz.
            return CreatedAtAction(nameof(Get), new { id = user.Id }, user);
        }

        // HTTP DELETE isteğiyle belirli bir ID'ye sahip ürünü silmek için kullanılır.
        // Örnek URL: DELETE /api/products/3
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            // Önce veritabanındaki ürünleri tarayıp, belirtilen ID'ye sahip olanı bulmaya çalışırız.
            var user = _context.Users.Find(id);

            // Eğer ürün bulunamazsa, kullanıcıya 404 Not Found hatası döneriz.
            if (user == null)
            {
                return NotFound($"ID'si {id} olan ürün bulunamadı.");
            }

            // Ürün bulunduysa, EF Core üzerinden veritabanından silinmek üzere işaretleriz.
            _context.Users.Remove(user);

            // Silme işlemini kalıcı hale getirmek için SaveChanges çağırılır.
            _context.SaveChanges();

            // 204 No Content → başarıyla silindi, ama gövde dönmeye gerek yok
            return NoContent();
        }

        // HTTP PUT isteğiyle mevcut bir ürünün bilgilerini güncellemek için kullanılır.
        // Örnek: PUT /api/products/2
        // Gövde (body): { "name": "Yeni Ürün Adı", "price": 1234.56 }
        [HttpPut("{id}")]
        public IActionResult Put(int id, [FromBody] User updatedUser)
        {
            // Önce veritabanında bu ID'ye sahip bir ürün olup olmadığını kontrol ederiz.
            var existingUser = _context.Users.Find(id);

            // Ürün yoksa 404 Not Found döneriz.
            if (existingUser == null)
            {
                return NotFound($"ID'si {id} olan ürün bulunamadı.");
            }


            // Veritabanındaki ürünün özelliklerini gelen veriyle güncelleriz.
            existingUser.Name = updatedUser.Name;
            existingUser.LName = updatedUser.LName;
            existingUser.Email = updatedUser.Email;
            existingUser.PNumber = updatedUser.PNumber;
            existingUser.BDate = updatedUser.BDate;

            // Değişiklikleri veritabanına kaydederiz.
            _context.SaveChanges();

            // 200 OK ve güncellenmiş ürünle birlikte döneriz.
            return Ok(existingUser);
        }



    }
}
