using FluentValidation;
using MediaMarket.API.DTOs.Users.Requests;
using MediaMarket.DAL.Enums;
using System.Text.RegularExpressions;

namespace MediaMarket.API.Validators.Users;

public class CreateUserRequestValidator : AbstractValidator<CreateUserRequest>
{
    public CreateUserRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email je povinny")
            .EmailAddress().WithMessage("Neplatny format emailu")
            .MaximumLength(255).WithMessage("Email moze mat maximalne 255 znakov");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Heslo je povinne")
            .MinimumLength(8).WithMessage("Heslo musi mat minimalne 8 znakov")
            .MaximumLength(100).WithMessage("Heslo moze mat maximalne 100 znakov");

        RuleFor(x => x.CompanyName)
            .NotEmpty().WithMessage("Nazov spolocnosti je povinny")
            .MaximumLength(255).WithMessage("Nazov spolocnosti moze mat maximalne 255 znakov");

        RuleFor(x => x.ContactName)
            .NotEmpty().WithMessage("Kontaktna osoba je povinna")
            .MaximumLength(255).WithMessage("Kontaktna osoba moze mat maximalne 255 znakov");

        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("Telefon je povinny")
            .MaximumLength(50).WithMessage("Telefon moze mat maximalne 50 znakov")
            .Must(BeValidPhone).WithMessage("Neplatny format telefonu");

        RuleFor(x => x.Role)
            .IsInEnum().WithMessage("Neplatna rola")
            .Must(role => role == UserRole.Agency || role == UserRole.Media)
            .WithMessage("Rola musi byt Agency alebo Media");
    }

    private static bool BeValidPhone(string? phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
            return false;

        var phoneRegex = new Regex(@"^[\d\s\+\-\(\)]+$");
        return phoneRegex.IsMatch(phone);
    }
}
