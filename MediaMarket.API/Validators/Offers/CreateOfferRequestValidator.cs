using FluentValidation;
using MediaMarket.API.DTOs.Offers.Requests;
using MediaMarket.DAL.Enums;

namespace MediaMarket.API.Validators.Offers;

public class CreateOfferRequestValidator : AbstractValidator<CreateOfferRequest>
{
    public CreateOfferRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Nazov ponuky je povinny")
            .MaximumLength(255).WithMessage("Nazov ponuky moze mat maximalne 255 znakov");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Popis je povinny")
            .MaximumLength(2000).WithMessage("Popis moze mat maximalne 2000 znakov");

        RuleFor(x => x.Format)
            .MaximumLength(255)
            .When(x => !string.IsNullOrEmpty(x.Format))
            .WithMessage("Format moze mat maximalne 255 znakov");

        RuleFor(x => x.MediaType)
            .IsInEnum().WithMessage("Neplatny typ media");

        RuleFor(x => x.PricingModel)
            .IsInEnum().WithMessage("Neplatny cenovy model");

        RuleFor(x => x.ValidFrom)
            .GreaterThanOrEqualTo(DateTime.UtcNow.Date)
            .WithMessage("Datum platnosti od nemoze byt skor ako dnes");

        RuleFor(x => x.ValidTo)
            .GreaterThan(x => x.ValidFrom).WithMessage("Datum do musi byt neskor ako datum od");

        RuleFor(x => x)
            .Must(HaveValidPricing).WithMessage("Pre UnitPrice model musite vyplnit UnitPrice, pre CPT model musite vyplnit CPT");

        RuleFor(x => x.DiscountPercent)
            .GreaterThanOrEqualTo(0).WithMessage("Zlavu nemozete mat zapornu")
            .LessThanOrEqualTo(100).WithMessage("Zlavu nemozete mat viac ako 100%");

        RuleFor(x => x.MinOrderValue)
            .GreaterThan(0).When(x => x.MinOrderValue.HasValue)
            .WithMessage("Minimalna hodnota objednavky musi byt vacsia ako 0");

        RuleFor(x => x.TechnicalConditionsText)
            .MaximumLength(2000)
            .When(x => !string.IsNullOrEmpty(x.TechnicalConditionsText))
            .WithMessage("Technicke podmienky mozu mat maximalne 2000 znakov");

        RuleFor(x => x.TechnicalConditionsUrl)
            .Must(url => string.IsNullOrEmpty(url) || Uri.TryCreate(url, UriKind.Absolute, out _))
            .When(x => !string.IsNullOrEmpty(x.TechnicalConditionsUrl))
            .WithMessage("URL technickych podmienok musi byt platna URL adresa")
            .MaximumLength(500)
            .When(x => !string.IsNullOrEmpty(x.TechnicalConditionsUrl))
            .WithMessage("URL technickych podmienok moze mat maximalne 500 znakov");

        // Validacia DeadlineAssetsAt >= ValidFrom
        RuleFor(x => x.DeadlineAssetsAt)
            .GreaterThanOrEqualTo(x => x.ValidFrom.Date)
            .When(x => x.DeadlineAssetsAt.HasValue)
            .WithMessage("Deadline na dodanie podkladov nemoze byt skor ako datum platnosti nabidky od");

        // Validacia LastOrderDay >= ValidFrom
        RuleFor(x => x.LastOrderDay)
            .GreaterThanOrEqualTo(x => x.ValidFrom.Date)
            .When(x => x.LastOrderDay.HasValue)
            .WithMessage("Posledny mozny den objednavky nemoze byt skor ako datum platnosti nabidky od");

        // Validacia LastOrderDay <= DeadlineAssetsAt (ak su oba vyplnene)
        RuleFor(x => x)
            .Must(x => !x.LastOrderDay.HasValue || !x.DeadlineAssetsAt.HasValue || 
                x.LastOrderDay.Value <= x.DeadlineAssetsAt.Value)
            .WithMessage("Posledny den objednavky nesmie byt neskor ako deadline pre zasielanie materialov");
    }

    private static bool HaveValidPricing(CreateOfferRequest request)
    {
        return request.PricingModel switch
        {
            PricingModel.UnitPrice => request.UnitPrice.HasValue && request.UnitPrice > 0,
            PricingModel.Cpt => request.Cpt.HasValue && request.Cpt > 0,
            _ => false
        };
    }
}
