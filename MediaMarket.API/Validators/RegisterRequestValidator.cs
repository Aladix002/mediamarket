using FluentValidation;
using MediaMarket.API.DTOs;
using MediaMarket.DAL.Enums;
using System.Text.RegularExpressions;

namespace MediaMarket.API.Validators;

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email je povinny")
            .EmailAddress().WithMessage("Neplatny format emailu")
            .MaximumLength(255).WithMessage("Email moze mat maximalne 255 znakov");

                RuleFor(x => x.Password)
                    .NotEmpty().WithMessage("Heslo je povinne")
                    .MinimumLength(8).WithMessage("Heslo musi mat minimalne 8 znakov")
                    .MaximumLength(100).WithMessage("Heslo moze mat maximalne 100 znakov")
                    .Must(BeValidPassword).WithMessage("Heslo musi obsahovat aspon jedno pismeno a aspon jednu cislicu");

        RuleFor(x => x.ConfirmPassword)
            .NotEmpty().WithMessage("Potvrdenie hesla je povinne")
            .Equal(x => x.Password).WithMessage("Heslá sa musia zhodovať");

        RuleFor(x => x.CompanyName)
            .NotEmpty().WithMessage("Názov firmy je povinný")
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
        {
            return false;
        }

        // Jednoducha validacia - telefon moze obsahovat cisla, medzery, +, -, ()
        var phoneRegex = new Regex(@"^[\d\s\+\-\(\)]+$");
        return phoneRegex.IsMatch(phone);
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
