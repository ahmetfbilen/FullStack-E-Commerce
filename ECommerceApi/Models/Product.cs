namespace ECommerceApi.Models
{
    public class Product
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public decimal Price { get; set; }
        public string Image { get; set; }
    }
}
