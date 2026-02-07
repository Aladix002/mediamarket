using FluentValidation;
using MediaMarket.DAL.Entities;
using MediaMarket.DAL.Enums;

namespace MediaMarket.BL.Validators;

public class OfferValidator : AbstractValidator<Offer>
{
    public OfferValidator()
    {
        RuleFor(o => o.Title)
            .NotEmpty().WithMessage("Nazov nabidky je povinny")
            .MaximumLength(500).WithMessage("Nazov nabidky moze mat maximalne 500 znakov");

        RuleFor(o => o.Description)
            .NotEmpty().WithMessage("Popis je povinny")
            .MaximumLength(2000).WithMessage("Popis moze mat maximalne 2000 znakov");

        RuleFor(o => o.MediaUserId)
            .NotEmpty().WithMessage("Media user ID je povinny");

        RuleFor(o => o.Format)
            .MaximumLength(255)
            .When(o => !string.IsNullOrEmpty(o.Format))
            .WithMessage("Format moze mat maximalne 255 znakov");

        RuleFor(o => o.MediaType)
            .IsInEnum().WithMessage("Neplatny typ media");

        RuleFor(o => o.PricingModel)
            .IsInEnum().WithMessage("Neplatny cenovy model");

        // Validacia ValidFrom >= dnes
        RuleFor(o => o.ValidFrom)
            .GreaterThanOrEqualTo(DateTime.UtcNow.Date)
            .WithMessage("Datum platnosti od nemoze byt skor ako dnes");

        // Validacia ValidTo > ValidFrom
        RuleFor(o => o)
            .Must(o => o.ValidTo > o.ValidFrom)
            .WithMessage("Datum platnosti do musi byt neskor ako datum platnosti od");

        // Validacia cenoveho modelu
        RuleFor(o => o)
            .Must(o => o.PricingModel == PricingModel.UnitPrice 
                ? o.UnitPrice.HasValue && o.UnitPrice.Value > 0
                : true)
            .WithMessage("Ak je cenovy model UnitPrice, musi byt vyplnena cena za jednotku");

        RuleFor(o => o)
            .Must(o => o.PricingModel == PricingModel.Cpt 
                ? o.Cpt.HasValue && o.Cpt.Value > 0
                : true)
            .WithMessage("Ak je cenovy model CPT, musi byt vyplnena CPT hodnota");

        // Validacia MinOrderValue
        RuleFor(o => o.MinOrderValue)
            .GreaterThan(0)
            .When(o => o.MinOrderValue.HasValue)
            .WithMessage("Minimalna hodnota objednavky musi byt vacsia ako 0");

        // Validacia DiscountPercent
        RuleFor(o => o.DiscountPercent)
            .GreaterThanOrEqualTo(0)
            .LessThanOrEqualTo(100)
            .WithMessage("Zlavne percento musi byt medzi 0 a 100");

        // Validacia TechnicalConditionsText
        RuleFor(o => o.TechnicalConditionsText)
            .MaximumLength(2000)
            .When(o => !string.IsNullOrEmpty(o.TechnicalConditionsText))
            .WithMessage("Technicke podmienky mozu mat maximalne 2000 znakov");

        // Validacia TechnicalConditionsUrl
        RuleFor(o => o.TechnicalConditionsUrl)
            .Must(url => string.IsNullOrEmpty(url) || Uri.TryCreate(url, UriKind.Absolute, out _))
            .When(o => !string.IsNullOrEmpty(o.TechnicalConditionsUrl))
            .WithMessage("URL technickych podmienok musi byt platna URL adresa")
            .MaximumLength(500)
            .When(o => !string.IsNullOrEmpty(o.TechnicalConditionsUrl))
            .WithMessage("URL technickych podmienok moze mat maximalne 500 znakov");

        // Validacia DeadlineAssetsAt >= ValidFrom
        RuleFor(o => o.DeadlineAssetsAt)
            .GreaterThanOrEqualTo(o => o.ValidFrom.Date)
            .When(o => o.DeadlineAssetsAt.HasValue)
            .WithMessage("Deadline na dodanie podkladov nemoze byt skor ako datum platnosti nabidky od");

        // Validacia LastOrderDay >= ValidFrom
        RuleFor(o => o.LastOrderDay)
            .GreaterThanOrEqualTo(o => o.ValidFrom.Date)
            .When(o => o.LastOrderDay.HasValue)
            .WithMessage("Posledny mozny den objednavky nemoze byt skor ako datum platnosti nabidky od");

        // Validacia LastOrderDay <= DeadlineAssetsAt (ak su oba vyplnene)
        RuleFor(o => o)
            .Must(o => !o.LastOrderDay.HasValue || !o.DeadlineAssetsAt.HasValue || 
                o.LastOrderDay.Value <= o.DeadlineAssetsAt.Value)
            .WithMessage("Posledny den objednavky nesmie byt neskor ako deadline pre zasielanie materialov");
    }
}
