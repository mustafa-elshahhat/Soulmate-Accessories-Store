using System.Text.RegularExpressions;

namespace SoulmateStore.Helpers;

public static partial class InputSanitizer
{
    /// <summary>
    /// Strips HTML tags from user input to prevent stored XSS.
    /// </summary>
    public static string StripHtml(string? input)
    {
        if (string.IsNullOrWhiteSpace(input)) return input ?? "";
        return HtmlTagRegex().Replace(input, "").Trim();
    }

    [GeneratedRegex("<[^>]*>", RegexOptions.Compiled)]
    private static partial Regex HtmlTagRegex();
}
