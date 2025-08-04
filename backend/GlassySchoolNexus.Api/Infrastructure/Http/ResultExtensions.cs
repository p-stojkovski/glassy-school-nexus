using GlassySchoolNexus.Core.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GlassySchoolNexus.Api.Infrastructure.Http;

/// <summary>
/// Extension methods for mapping Result types to HTTP responses
/// </summary>
public static class ResultExtensions
{
    /// <summary>
    /// Converts an Error to an HTTP result following RFC 9457 Problem Details format
    /// </summary>
    /// <param name="error">The error to convert</param>
    /// <returns>An HTTP result representing the error</returns>
    public static IResult ToHttpResult(this Error error) => error.Code switch
    {
        "not_found" => Results.Problem(
            statusCode: StatusCodes.Status404NotFound,
            title: "Resource Not Found",
            detail: error.Description,
            type: "https://tools.ietf.org/html/rfc7231#section-6.5.4"),
        
        "validation_failed" => Results.ValidationProblem(
            new Dictionary<string, string[]> { ["validation"] = [error.Description] }),
        
        "conflict" => Results.Problem(
            statusCode: StatusCodes.Status409Conflict,
            title: "Conflict",
            detail: error.Description,
            type: "https://tools.ietf.org/html/rfc7231#section-6.5.8"),
        
        "unauthorized" => Results.Problem(
            statusCode: StatusCodes.Status401Unauthorized,
            title: "Unauthorized",
            detail: error.Description,
            type: "https://tools.ietf.org/html/rfc7235#section-3.1"),
        
        "forbidden" => Results.Problem(
            statusCode: StatusCodes.Status403Forbidden,
            title: "Forbidden",
            detail: error.Description,
            type: "https://tools.ietf.org/html/rfc7231#section-6.5.3"),
        
        _ => Results.Problem(
            statusCode: StatusCodes.Status500InternalServerError,
            title: "Internal Server Error",
            detail: "An unexpected error occurred",
            type: "https://tools.ietf.org/html/rfc7231#section-6.6.1")
    };

    /// <summary>
    /// Converts a Result to an HTTP response
    /// </summary>
    /// <param name="result">The result to convert</param>
    /// <returns>An HTTP result</returns>
    public static IResult ToHttpResult(this Result result)
    {
        return result.IsSuccess 
            ? Results.NoContent()
            : result.Error!.ToHttpResult();
    }

    /// <summary>
    /// Converts a Result&lt;T&gt; to an HTTP response
    /// </summary>
    /// <typeparam name="T">The value type</typeparam>
    /// <param name="result">The result to convert</param>
    /// <returns>An HTTP result</returns>
    public static IResult ToHttpResult<T>(this Result<T> result)
    {
        return result.IsSuccess 
            ? Results.Ok(result.Value)
            : result.Error!.ToHttpResult();
    }

    /// <summary>
    /// Converts a Result&lt;T&gt; to a Created HTTP response
    /// </summary>
    /// <typeparam name="T">The value type</typeparam>
    /// <param name="result">The result to convert</param>
    /// <param name="uri">The URI of the created resource</param>
    /// <returns>An HTTP result</returns>
    public static IResult ToCreatedResult<T>(this Result<T> result, string uri)
    {
        return result.IsSuccess 
            ? Results.Created(uri, result.Value)
            : result.Error!.ToHttpResult();
    }
}