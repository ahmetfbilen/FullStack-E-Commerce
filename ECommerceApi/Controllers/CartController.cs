using ECommerceApi.Data;
using ECommerceApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerceApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CartController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CartController(AppDbContext context)
        {
            _context = context;
        }

        // Sepete ürün ekle
        [HttpPost("add")]
        public async Task<IActionResult> AddToCart(int userId, int productId, int quantity)
        {
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            // Sepeti yoksa oluştur
            if (cart == null)
            {
                cart = new Cart { UserId = userId, CartItems = new List<CartItem>() };
                _context.Carts.Add(cart);
                await _context.SaveChangesAsync(); // Id almak için
            }

            // Aynı üründen varsa miktarı artır
            var existingItem = cart.CartItems.FirstOrDefault(ci => ci.ProductId == productId);
            if (existingItem != null)
            {
                existingItem.Quantiity += quantity;
            }
            else
            {
                cart.CartItems.Add(new CartItem
                {
                    ProductId = productId,
                    Quantiity = quantity
                });
            }

            await _context.SaveChangesAsync();
            return Ok(cart);
        }

        // Kullanıcının sepetini getir
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetCartByUser(int userId)
        {
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .ThenInclude(ci => ci.Product)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
                return NotFound("Sepet bulunamadı");

            return Ok(cart);
        }

        [HttpPut("update-quantity")]
        public async Task<IActionResult> UpdateQuantity(int userId, int productId, int quantity)
        {
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
                return NotFound();

            var item = cart.CartItems.FirstOrDefault(i => i.ProductId == productId);
            if (item == null)
                return NotFound();

            item.Quantiity = quantity;
            await _context.SaveChangesAsync();

            return Ok(cart);
        }

        [HttpDelete("remove")]
        public async Task<IActionResult> RemoveItem(int userId, int productId)
        {
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
                return NotFound();

            var item = cart.CartItems.FirstOrDefault(i => i.ProductId == productId);
            if (item == null)
                return NotFound();

            _context.CartItems.Remove(item);
            await _context.SaveChangesAsync();

            return Ok(cart);
        }


    }
}
