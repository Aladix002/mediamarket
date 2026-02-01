using FluentValidation;
using MediaMarket.DAL.Entities;
using MediaMarket.DAL.Enums;
using System.Text.RegularExpressions;

namespace MediaMarket.BL.Validators;

public class UserValidator : AbstractValidator<User>
{
    public UserValidator()
    {
        RuleFor(u => u.Email)
            .NotEmpty().WithMessage("Email je povinny")
            .EmailAddress().WithMessage("Neplatny format emailu")
            .MaximumLength(255).WithMessage("Email moze mat maximalne 255 znakov");

        RuleFor(u => u.PasswordHash)
            .NotEmpty().WithMessage("Heslo je povinne")
            .MinimumLength(8).WithMessage("Heslo musi mat minimalne 8 znakov");

        RuleFor(u => u.CompanyName)
            .NotEmpty().WithMessage("Nazov spolocnosti je povinny")
            .MaximumLength(255).WithMessage("Nazov spolocnosti moze mat maximalne 255 znakov");

        RuleFor(u => u.ContactName)
            .NotEmpty().WithMessage("Kontaktna osoba je povinna")
            .MaximumLength(255).WithMessage("Kontaktna osoba moze mat maximalne 255 znakov");

        RuleFor(u => u.Phone)
            .NotEmpty().WithMessage("Telefon je povinny")
            .MaximumLength(50).WithMessage("Telefon moze mat maximalne 50 znakov")
            .Must(BeValidPhone).WithMessage("Neplatny format telefonu");

        RuleFor(u => u.Role)
            .IsInEnum().WithMessage("Neplatna rola");

        RuleFor(u => u.Status)
            .IsInEnum().WithMessage("Neplatny status");
    }

    private static bool BeValidPhone(string? phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
        {
            return false;
        }

        // Jednoducha validacia - telefon moze obsahovat cisla, medzery, +, -, ()
        var phoneRegex = new Regex(@"^[\d\s\+\-\(\)]+$");
        return phoneRegex.IsMatch(phone);
    }
}
