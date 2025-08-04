namespace GlassySchoolNexus.Core.Common;

/// <summary>
/// Standard error catalog for common error scenarios
/// </summary>
public static class StandardErrors
{
    /// <summary>
    /// Creates a not found error for the specified entity and identifier
    /// </summary>
    /// <param name="entity">The entity type that was not found</param>
    /// <param name="id">The identifier that was searched for</param>
    /// <returns>A not found error</returns>
    public static Error NotFound(string entity, string id) => 
        new("not_found", $"{entity} with id '{id}' was not found");

    /// <summary>
    /// Creates a validation error for the specified field and message
    /// </summary>
    /// <param name="field">The field that failed validation</param>
    /// <param name="message">The validation error message</param>
    /// <returns>A validation error</returns>
    public static Error Validation(string field, string message) =>
        new("validation_failed", $"{field}: {message}");

    /// <summary>
    /// Creates a conflict error for the specified resource and reason
    /// </summary>
    /// <param name="resource">The resource that has a conflict</param>
    /// <param name="reason">The reason for the conflict</param>
    /// <returns>A conflict error</returns>
    public static Error Conflict(string resource, string reason) =>
        new("conflict", $"Conflict with {resource}: {reason}");

    /// <summary>
    /// Creates an unauthorized error
    /// </summary>
    /// <returns>An unauthorized error</returns>
    public static Error Unauthorized() =>
        new("unauthorized", "Access to this resource is not authorized");

    /// <summary>
    /// Creates a forbidden error with optional reason
    /// </summary>
    /// <param name="reason">Optional reason for the forbidden access</param>
    /// <returns>A forbidden error</returns>
    public static Error Forbidden(string? reason = null) =>
        new("forbidden", reason ?? "Access to this resource is forbidden");

    /// <summary>
    /// Creates an internal error for unexpected system failures
    /// </summary>
    /// <param name="message">Optional internal error message</param>
    /// <returns>An internal error</returns>
    public static Error Internal(string? message = null) =>
        new("internal_error", message ?? "An internal error occurred");
}