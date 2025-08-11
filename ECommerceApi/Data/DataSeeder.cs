using Bogus;
using ECommerceApi.Models;
using EFCore.BulkExtensions;

namespace ECommerceApi.Data
{
    public class DataSeeder
    {
        public static void SeedUsers(AppDbContext context)
        {
            // Eğer tabloda hiç kullanıcı yoksa ekle
            if (context.Users.Count() < 5000)
            {
                var faker = new Faker<User>("tr") // Türkçe veriler
                    .RuleFor(u => u.Name, f => f.Name.FirstName())
                    .RuleFor(u => u.LName, f => f.Name.LastName())
                    .RuleFor(u => u.Email, (f, u) => $"{u.Name}.{u.LName}{Guid.NewGuid()}@example.com")
                    .RuleFor(u => u.PasswordHash, f => BCrypt.Net.BCrypt.HashPassword("12345678")) // Test şifresi
                    .RuleFor(u => u.Role, f => f.PickRandom(new[] { "User", "Admin", "Seller" }))
                    .RuleFor(u => u.PNumber, f => double.Parse(f.Phone.PhoneNumber("5#########")))
                    .RuleFor(u => u.BDate, f => f.Date.Past(30, DateTime.Now.AddYears(-18))); // 18-48 yaş arası

                var users = faker.Generate(10000); // 10 bin kullanıcı üret

                context.BulkInsert(users); // Çok hızlı ekler
            }
        }
    }
}