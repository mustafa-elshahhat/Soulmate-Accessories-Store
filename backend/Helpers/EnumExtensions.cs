using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace SoulmateStore.Helpers;

public static partial class EnumExtensions
{
    /// <summary>
    /// Creates a ValueConverter that stores enum values as snake_case strings in the database.
    /// </summary>
    public static ValueConverter<TEnum, string> SnakeCaseConverter<TEnum>() where TEnum : struct, Enum
    {
        return new ValueConverter<TEnum, string>(
            v => v.ToDbString(),
            v => FromDbString<TEnum>(v));
    }

    /// <summary>
    /// Converts an enum value to its snake_case database string representation.
    /// e.g., OrderStatus.PaymentReview -> "payment_review"
    /// </summary>
    public static string ToDbString<TEnum>(this TEnum value) where TEnum : struct, Enum
    {
        return PascalToSnakeCase(value.ToString());
    }

    /// <summary>
    /// Parses a snake_case database string back to the enum value.
    /// e.g., "payment_review" -> OrderStatus.PaymentReview
    /// </summary>
    public static TEnum FromDbString<TEnum>(string dbValue) where TEnum : struct, Enum
    {
        var pascalCase = SnakeToPascalCase(dbValue);
        return Enum.Parse<TEnum>(pascalCase, ignoreCase: true);
    }

    private static string PascalToSnakeCase(string input)
    {
        return PascalToSnakeRegex().Replace(input, "$1_$2").ToLowerInvariant();
    }

    private static string SnakeToPascalCase(string input)
    {
        return string.Concat(
            input.Split('_').Select(part =>
                string.IsNullOrEmpty(part) ? part : char.ToUpper(part[0]) + part[1..]));
    }

    [GeneratedRegex(@"([a-z0-9])([A-Z])")]
    private static partial Regex PascalToSnakeRegex();
}
