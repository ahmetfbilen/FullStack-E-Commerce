using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace ECommerceApi.Models
{
    public class Category
    {
        public int Id { get; set; }
        [Required]
        [MaxLength(75)]
        public required string Name { get; set; }
        public ICollection<Product>? Products { get; set; }
    }
}