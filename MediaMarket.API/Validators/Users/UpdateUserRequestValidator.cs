using FluentValidation;
using MediaMarket.API.DTOs.Users.Requests;
using System.Text.RegularExpressions;

namespace MediaMarket.API.Validators.Users;

public class UpdateUserRequestValidator : AbstractValidator<UpdateUserRequest>
{
    public UpdateUserRequestValidator()
    {
        // CompanyName je voliteľný (nie je možné ho meniť cez profil)
        RuleFor(x => x.CompanyName)
            .MaximumLength(255).WithMessage("Nazov spolocnosti moze mat maximalne 255 znakov")
            .When(x => !string.IsNullOrEmpty(x.CompanyName));

        RuleFor(x => x.ContactName)
            .NotEmpty().WithMessage("Kontaktna osoba je povinna")
            .MaximumLength(255).WithMessage("Kontaktna osoba moze mat maximalne 255 znakov");

        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("Telefon je povinny")
            .MaximumLength(50).WithMessage("Telefon moze mat maximalne 50 znakov")
            .Must(BeValidPhone).WithMessage("Neplatny format telefonu");
    }

    private static bool BeValidPhone(string? phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
            return false;

        var phoneRegex = new Regex(@"^[\d\s\+\-\(\)]+$");
        return phoneRegex.IsMatch(phone);
    }
}
