namespace GlassySchoolNexus.Core.Common;

/// <summary>
/// Represents an error with a code and description
/// </summary>
/// <param name="Code">The error code identifier</param>
/// <param name="Description">The human-readable error description</param>
public sealed record Error(string Code, string Description)
{
    /// <summary>
    /// Creates a new Error instance
    /// </summary>
    /// <param name="code">The error code identifier</param>
    /// <param name="description">The human-readable error description</param>
    /// <returns>A new Error instance</returns>
    public static Error New(string code, string description) => new(code, description);
}