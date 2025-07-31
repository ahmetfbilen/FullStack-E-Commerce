using System.ComponentModel.DataAnnotations;

namespace ECommerceApi.Models // Veya ECommerceApi.DTOs
{
    public class UserLoginDto
    {
        [Required]
        [EmailAddress]
        public required string Email { get; set; }

        [Required]
        public required string Password { get; set; }
    }
}