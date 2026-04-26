namespace SoulmateStore.Exceptions;

public class AppException : Exception
{
    public string ErrorCode { get; }

    public AppException(string errorCode, string message) : base(message)
    {
        ErrorCode = errorCode;
    }
}

public class BadRequestException : AppException
{
    public BadRequestException(string errorCode, string message) : base(errorCode, message) { }
}

public class NotFoundException : AppException
{
    public NotFoundException(string errorCode, string message) : base(errorCode, message) { }
}

public class UnauthorizedException : AppException
{
    public UnauthorizedException(string errorCode, string message) : base(errorCode, message) { }
}

public class ForbiddenException : AppException
{
    public ForbiddenException(string errorCode, string message) : base(errorCode, message) { }
}

public class ConflictException : AppException
{
    public ConflictException(string errorCode, string message) : base(errorCode, message) { }
}

public class ValidationException : AppException
{
    public List<FieldError> Errors { get; }

    public ValidationException(List<FieldError> errors)
        : base("VALIDATION_ERROR", "بيانات غير صالحة")
    {
        Errors = errors;
    }
}

public record FieldError(string Field, string Message);
