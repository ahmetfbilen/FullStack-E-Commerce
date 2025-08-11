using StackExchange.Redis;

namespace ECommerceApi.Services
{
    public class RedisService
    {
        private readonly ConnectionMultiplexer _connection;
        public IDatabase Database { get; }

        public RedisService(string connectionString)
        {
            _connection = ConnectionMultiplexer.Connect(connectionString);
            Database = _connection.GetDatabase();
        }
    }
}