using FluentValidation;
using GlassySchoolNexus.Core.Common;

namespace GlassySchoolNexus.Core.Infrastructure.Validation;

/// <summary>
/// Validation behavior for command and query validation
/// </summary>
/// <typeparam name="TRequest">The request type</typeparam>
public sealed class ValidationBehavior<TRequest>
{
    private readonly IValidator<TRequest>? _validator;

    /// <summary>
    /// Initializes a new instance of the validation behavior
    /// </summary>
    /// <param name="validator">The validator for the request type (optional)</param>
    public ValidationBehavior(IValidator<TRequest>? validator = null)
    {
        _validator = validator;
    }

    /// <summary>
    /// Validates the request and returns validation errors if any
    /// </summary>
    /// <param name="request">The request to validate</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Validation result containing any errors</returns>
    public async Task<Result> ValidateAsync(TRequest request, CancellationToken cancellationToken = default)
    {
        if (_validator is null)
            return Result.Success();

        var validationResult = await _validator.ValidateAsync(request, cancellationToken);
        
        if (validationResult.IsValid)
            return Result.Success();

        var errors = validationResult.Errors
            .Select(error => StandardErrors.Validation(error.PropertyName, error.ErrorMessage))
            .ToList();

        // Return the first validation error
        return Result.Failure(errors.First());
    }
}