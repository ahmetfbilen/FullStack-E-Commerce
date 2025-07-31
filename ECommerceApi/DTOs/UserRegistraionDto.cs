using System.ComponentModel.DataAnnotations;

namespace ECommerceApi.Models // Veya ECommerceApi.DTOs
{
    public class UserRegistrationDto
    {
        [Required]
        [MaxLength(100)]
        public required string Name { get; set; }

        [Required]
        [MaxLength(100)]
        public required string LName { get; set; }

        [Required]
        [EmailAddress]
        [MaxLength(255)]
        public required string Email { get; set; }

        [Required]
        [MinLength(6)] // Şifre için minimum uzunluk
        [MaxLength(255)]
        public required string Password { get; set; } // Düz metin şifre

        public double PNumber { get; set; }
        public DateTime BDate { get; set; }
    }
}