using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace YourNamespace.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly HttpClient _httpClient;

        public ChatController(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        [HttpPost("stream")]
        public async Task StreamMessage([FromBody] ChatRequest request)
        {
            Response.ContentType = "application/json";

            var ollamaRequest = new
            {
                model = "llama3",
                prompt = request.Message,
                stream = true
            };

            var content = new StringContent(JsonSerializer.Serialize(ollamaRequest), Encoding.UTF8, "application/json");

            var httpRequest = new HttpRequestMessage(HttpMethod.Post, "http://localhost:11434/api/generate")
            {
                Content = content
            };

            var response = await _httpClient.SendAsync(httpRequest, HttpCompletionOption.ResponseHeadersRead);

            var stream = await response.Content.ReadAsStreamAsync();
            using var reader = new StreamReader(stream);

            while (!reader.EndOfStream)
            {
                var line = await reader.ReadLineAsync();
                if (!string.IsNullOrWhiteSpace(line))
                {
                    await Response.WriteAsync(line + "\n");
                    await Response.Body.FlushAsync();
                }
            }
        }
    }

    public class ChatRequest
    {
        public string Message { get; set; }
    }
}