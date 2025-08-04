using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace GlassySchoolNexus.Core.Infrastructure.Validation;

/// <summary>
/// Extension methods for configuring validation
/// </summary>
public static class ValidationExtensions
{
    /// <summary>
    /// Adds FluentValidation services to the service collection
    /// </summary>
    /// <param name="services">The service collection</param>
    /// <param name="assemblies">Assemblies to scan for validators</param>
    /// <returns>The service collection for chaining</returns>
    public static IServiceCollection AddValidation(
        this IServiceCollection services,
        params Assembly[] assemblies)
    {
        services.AddValidatorsFromAssemblies(assemblies);
        return services;
    }
}