using System.Data;
using Npgsql;

namespace GlassySchoolNexus.Core.Infrastructure.Database;

/// <summary>
/// PostgreSQL implementation of the database connection factory
/// </summary>
public sealed class PostgreSqlConnectionFactory : IDbConnectionFactory
{
    private readonly string _connectionString;

    /// <summary>
    /// Initializes a new instance of the PostgreSQL connection factory
    /// </summary>
    /// <param name="connectionString">The PostgreSQL connection string</param>
    /// <exception cref="ArgumentException">Thrown when connection string is null or empty</exception>
    public PostgreSqlConnectionFactory(string connectionString)
    {
        if (string.IsNullOrWhiteSpace(connectionString))
            throw new ArgumentException("Connection string cannot be null or empty", nameof(connectionString));
        
        _connectionString = connectionString;
    }

    /// <summary>
    /// Creates a new PostgreSQL database connection
    /// </summary>
    /// <returns>A new PostgreSQL database connection</returns>
    public IDbConnection CreateConnection()
    {
        return new NpgsqlConnection(_connectionString);
    }
}