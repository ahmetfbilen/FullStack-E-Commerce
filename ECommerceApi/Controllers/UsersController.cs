using Microsoft.AspNetCore.Mvc;
using ECommerceApi.Data;
using ECommerceApi.Models;
using BCrypt.Net; // hash için
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims; //JWT'nin içine kullanıcı ID'si, e-posta ve rol gibi bilgileri Claim olarak ekler
using Microsoft.IdentityModel.Tokens;
using System.Text; // 5️⃣ Bu satırı ekleyin
using Microsoft.AspNetCore.Authorization;

namespace ECommerceApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration; // 6️⃣ IConfiguration'ı inject edin

        public UsersController(AppDbContext context, IConfiguration configuration) // 7️⃣ Constructor'ı güncelleyin
        {
            _context = context;
            _configuration = configuration; // 8️⃣ IConfiguration'ı atayın
        }

        // Mevcut Get metodu

        [HttpGet]
        public IActionResult Get()
        {
            return Ok(_context.Users.ToList());
        }

        // 9️⃣ Yeni Kayıt (Register) Endpoint'i
        // URL: POST /api/users/register
        [HttpPost("register")] // Route'u "register" olarak belirledik
        public async Task<IActionResult> Register([FromBody] UserRegistrationDto request) // 10️⃣ Yeni bir DTO kullanacağız
        {
            // E-posta zaten kayıtlı mı kontrol et
            if (_context.Users.Any(u => u.Email == request.Email))
            {
                return BadRequest("Bu e-posta adresi zaten kayıtlı.");
            }

            // Şifreyi hash'le
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // Yeni kullanıcı nesnesini oluştur
            var user = new User
            {
                Name = request.Name,
                LName = request.LName,
                Email = request.Email,
                PasswordHash = passwordHash,
                Role = "User", // Varsayılan rol "User" olarak ayarlandı
                PNumber = request.PNumber,
                BDate = request.BDate
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync(); // Async olarak kaydet

            return StatusCode(201, "Kullanıcı başarıyla kaydedildi."); // 201 Created döndür
        }

        // 11️⃣ Yeni Giriş (Login) Endpoint'i
        // URL: POST /api/users/login
        [HttpPost("login")] // Route'u "login" olarak belirledik
        public IActionResult Login([FromBody] UserLoginDto request) // 12️⃣ Yeni bir DTO kullanacağız
        {
            // Kullanıcıyı e-posta ile bul
            var user = _context.Users.FirstOrDefault(u => u.Email == request.Email);

            if (user == null)
            {
                return BadRequest("Kullanıcı adı veya şifre yanlış.");
            }

            // Şifreyi doğrula
            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return BadRequest("Kullanıcı adı veya şifre yanlış.");
            }

            // JWT Oluştur
            var token = CreateToken(user);

            return Ok(new { Token = token }); // Token'ı döndür
        }

        // 13️⃣ JWT Oluşturma Metodu
        private string CreateToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["Secret"];
            var issuer = jwtSettings["Issuer"];
            var audience = jwtSettings["Audience"];
            var expiryMinutes = double.Parse(jwtSettings["ExpiryMinutes"]);

            List<Claim> claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), // Kullanıcı ID'si
                new Claim(ClaimTypes.Email, user.Email), // Kullanıcı E-postası
                new Claim(ClaimTypes.Role, user.Role) // Kullanıcı Rolü
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.Now.AddMinutes(expiryMinutes), // Token'ın geçerlilik süresi
                signingCredentials: creds
            );

            var jwt = new JwtSecurityTokenHandler().WriteToken(token);

            return jwt;
        }

        // Mevcut Delete metodu
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public IActionResult Delete(int id)
        {
            var user = _context.Users.Find(id);
            if (user == null)
            {
                return NotFound($"ID'si {id} olan kullanıcı bulunamadı.");
            }
            _context.Users.Remove(user);
            _context.SaveChanges();
            return NoContent();
        }

        // Mevcut Put metodu
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public IActionResult Put(int id, [FromBody] User updatedUser)
        {
            var existingUser = _context.Users.Find(id);
            if (existingUser == null)
            {
                return NotFound($"ID'si {id} olan kullanıcı bulunamadı.");
            }

            existingUser.Name = updatedUser.Name;
            existingUser.LName = updatedUser.LName;
            existingUser.Email = updatedUser.Email;
            // Şifre güncelleme mantığı burada daha karmaşık olabilir.
            // Eğer şifre de güncelleniyorsa, yeni şifrenin hash'lenmesi gerekir.
            // Şimdilik PasswordHash'i doğrudan güncellemiyoruz, çünkü bu PUT metodu
            // genellikle profil bilgilerini güncellemek için kullanılır.
            // Şifre değişimi için ayrı bir endpoint daha güvenli olur.
            existingUser.PNumber = updatedUser.PNumber;
            existingUser.BDate = updatedUser.BDate;
            existingUser.Role = updatedUser.Role; // Rolü de güncelleyebiliriz//
            //                                      //-_--_-\\
            // bence de güncelleyebiliriz [[[[[[[[//[[ */*]\\]]]]]]]]]
            //          

            _context.SaveChanges();
            return Ok(existingUser);
        }
    }
}