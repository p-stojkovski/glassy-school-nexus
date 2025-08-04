namespace GlassySchoolNexus.Core.Common;

/// <summary>
/// Represents the result of an operation that can either succeed with a value or fail with an error
/// </summary>
/// <typeparam name="T">The type of the success value</typeparam>
public sealed record Result<T>
{
    /// <summary>
    /// The success value (null if operation failed)
    /// </summary>
    public T? Value { get; }
    
    /// <summary>
    /// The error information (null if operation succeeded)
    /// </summary>
    public Error? Error { get; }
    
    /// <summary>
    /// Indicates whether the operation was successful
    /// </summary>
    public bool IsSuccess { get; }
    
    /// <summary>
    /// Indicates whether the operation failed
    /// </summary>
    public bool IsFailure => !IsSuccess;

    private Result(T value)
    {
        Value = value;
        Error = null;
        IsSuccess = true;
    }

    private Result(Error error)
    {
        Value = default;
        Error = error;
        IsSuccess = false;
    }

    /// <summary>
    /// Creates a successful result with the specified value
    /// </summary>
    /// <param name="value">The success value</param>
    /// <returns>A successful Result instance</returns>
    public static Result<T> Success(T value) => new(value);

    /// <summary>
    /// Creates a failed result with the specified error
    /// </summary>
    /// <param name="error">The error information</param>
    /// <returns>A failed Result instance</returns>
    public static Result<T> Failure(Error error) => new(error);

    /// <summary>
    /// Implicitly converts a value to a successful Result
    /// </summary>
    /// <param name="value">The value to convert</param>
    /// <returns>A successful Result containing the value</returns>
    public static implicit operator Result<T>(T value) => Success(value);

    /// <summary>
    /// Implicitly converts an Error to a failed Result
    /// </summary>
    /// <param name="error">The error to convert</param>
    /// <returns>A failed Result containing the error</returns>
    public static implicit operator Result<T>(Error error) => Failure(error);
}

/// <summary>
/// Represents the result of an operation that can either succeed or fail without returning a value
/// </summary>
public sealed record Result
{
    /// <summary>
    /// The error information (null if operation succeeded)
    /// </summary>
    public Error? Error { get; }
    
    /// <summary>
    /// Indicates whether the operation was successful
    /// </summary>
    public bool IsSuccess { get; }
    
    /// <summary>
    /// Indicates whether the operation failed
    /// </summary>
    public bool IsFailure => !IsSuccess;

    private Result(bool isSuccess, Error? error = null)
    {
        IsSuccess = isSuccess;
        Error = error;
    }

    /// <summary>
    /// Creates a successful result
    /// </summary>
    /// <returns>A successful Result instance</returns>
    public static Result Success() => new(true);

    /// <summary>
    /// Creates a failed result with the specified error
    /// </summary>
    /// <param name="error">The error information</param>
    /// <returns>A failed Result instance</returns>
    public static Result Failure(Error error) => new(false, error);

    /// <summary>
    /// Implicitly converts an Error to a failed Result
    /// </summary>
    /// <param name="error">The error to convert</param>
    /// <returns>A failed Result containing the error</returns>
    public static implicit operator Result(Error error) => Failure(error);
}