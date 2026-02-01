using FluentValidation;
using MediaMarket.API.DTOs;

namespace MediaMarket.API.Validators;

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email je povinny")
            .EmailAddress().WithMessage("Neplatny format emailu");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Heslo je povinne")
            .MinimumLength(6).WithMessage("Heslo musi mat minimalne 6 znakov");
    }
}
