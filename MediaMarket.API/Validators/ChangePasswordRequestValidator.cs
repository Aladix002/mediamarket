using FluentValidation;
using MediaMarket.API.DTOs;

namespace MediaMarket.API.Validators;

public class ChangePasswordRequestValidator : AbstractValidator<ChangePasswordRequest>
{
    public ChangePasswordRequestValidator()
    {
        RuleFor(x => x.CurrentPassword)
            .NotEmpty().WithMessage("Aktuálne heslo je povinné");

        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("Nové heslo je povinné")
            .MinimumLength(8).WithMessage("Nové heslo musí mať minimálne 8 znakov")
            .MaximumLength(100).WithMessage("Nové heslo môže mať maximálne 100 znakov")
            .Must(BeValidPassword).WithMessage("Nové heslo musí obsahovať aspoň jedno písmeno a aspoň jednu číslicu");

        RuleFor(x => x.ConfirmPassword)
            .NotEmpty().WithMessage("Potvrdenie hesla je povinné")
            .Equal(x => x.NewPassword).WithMessage("Heslá sa nezhodujú");
    }

    private static bool BeValidPassword(string? password)
    {
        if (string.IsNullOrWhiteSpace(password))
            return false;

        // Musí obsahovať aspoň jedno písmeno a aspoň jednu číslicu
        var hasLetter = password.Any(char.IsLetter);
        var hasDigit = password.Any(char.IsDigit);
        
        return hasLetter && hasDigit;
    }
}
