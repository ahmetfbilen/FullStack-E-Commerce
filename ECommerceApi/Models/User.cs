using System.ComponentModel.DataAnnotations;
//jwt için
namespace ECommerceApi.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required] // Bu nitelik, alanın boş bırakılamayacağını belirtir
        [MaxLength(100)] // Maksimum uzunluk belirleyebiliriz
        public required string Name { get; set; }

        [Required]
        [MaxLength(100)]
        public required string LName { get; set; }

        [Required]
        [EmailAddress]
        [MaxLength(255)]
        public required string Email { get; set; }

        [Required]
        [MaxLength(255)] // şifre hash için 255 yap
        public required string PasswordHash { get; set; } //hashlenmiş şifrenin tutulması için. normal şifreyi db de tutmak yok

        [Required]
        [MaxLength(50)]
        public required string Role { get; set; } // admin seller user vs
        public double PNumber { get; set; }
        public DateTime BDate { get; set; }
    }
}
