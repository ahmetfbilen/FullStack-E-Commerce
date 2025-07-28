namespace ECommerceApi.Models
{
    public class User
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string LName { get; set; }
        public required string Email { get; set; }
        public double PNumber { get; set; }
        public DateTime BDate { get; set; }
    }
}
