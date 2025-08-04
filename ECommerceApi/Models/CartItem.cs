using ECommerceApi.Models;
public class CartItem
{
    public int Id { get; set; }
    public int CartId { get; set; }
    public Cart Cart { get; set; }

    public int ProductId { get; set; }
    public Product Product { get; set; }//ürünün tüm bilgilerin tutar
    public int Quantiity { get; set; }

}