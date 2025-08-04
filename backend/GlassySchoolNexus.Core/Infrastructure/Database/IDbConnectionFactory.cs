using System.Data;

namespace GlassySchoolNexus.Core.Infrastructure.Database;

/// <summary>
/// Factory interface for creating database connections
/// </summary>
public interface IDbConnectionFactory
{
    /// <summary>
    /// Creates a new database connection
    /// </summary>
    /// <returns>A new database connection</returns>
    IDbConnection CreateConnection();
}