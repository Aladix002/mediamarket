using FluentValidation;
using MediaMarket.DAL.Entities;
using MediaMarket.DAL.Enums;

namespace MediaMarket.BL.Validators;

public class OrderValidator : AbstractValidator<Order>
{
    public OrderValidator()
    {
        RuleFor(o => o.OrderNumber)
            .NotEmpty().WithMessage("Cislo objednavky je povinne")
            .MaximumLength(50).WithMessage("Cislo objednavky moze mat maximalne 50 znakov");

        RuleFor(o => o.OfferId)
            .NotEmpty().WithMessage("ID nabidky je povinne");

        RuleFor(o => o.AgencyUserId)
            .NotEmpty().WithMessage("ID agentury je povinne");

        RuleFor(o => o.MediaUserId)
            .NotEmpty().WithMessage("ID media je povinne");

        // Validacia PreferredFrom >= dnes
        RuleFor(o => o.PreferredFrom)
            .GreaterThanOrEqualTo(DateTime.UtcNow.Date)
            .WithMessage("Preferovany termin od nemoze byt skor ako dnes");

        // Validacia PreferredTo >= PreferredFrom
        RuleFor(o => o)
            .Must(o => o.PreferredTo >= o.PreferredFrom)
            .WithMessage("Preferovany termin do musi byt stejny nebo neskor ako preferovany termin od");

        RuleFor(o => o.PricingModelSnapshot)
            .IsInEnum().WithMessage("Neplatny cenovy model");

        // Validacia cenoveho modelu - UnitPrice
        RuleFor(o => o)
            .Must(o => o.PricingModelSnapshot == PricingModel.UnitPrice
                ? o.UnitPriceSnapshot.HasValue && o.UnitPriceSnapshot.Value > 0
                    && o.QuantityUnits.HasValue && o.QuantityUnits.Value >= 1 && o.QuantityUnits.Value <= 100
                : true)
            .WithMessage("Ak je cenovy model UnitPrice, musi byt vyplnena cena za jednotku a pocet jednotiek (1-100)");

        // Validacia cenoveho modelu - CPT
        RuleFor(o => o)
            .Must(o => o.PricingModelSnapshot == PricingModel.Cpt
                ? o.CptSnapshot.HasValue && o.CptSnapshot.Value > 0
                    && o.Impressions.HasValue && o.Impressions.Value > 0
                : true)
            .WithMessage("Ak je cenovy model CPT, musi byt vyplnena CPT hodnota a pocet impresii");

        // Validacia QuantityUnits (1-100)
        RuleFor(o => o.QuantityUnits)
            .InclusiveBetween(1, 100)
            .When(o => o.QuantityUnits.HasValue)
            .WithMessage("Pocet jednotiek musi byt medzi 1 a 100");

        // Validacia Impressions
        RuleFor(o => o.Impressions)
            .GreaterThan(0)
            .When(o => o.Impressions.HasValue)
            .WithMessage("Pocet impresii musi byt vacsi ako 0");

        // Validacia TotalPrice
        RuleFor(o => o.TotalPrice)
            .GreaterThan(0)
            .WithMessage("Celkova cena musi byt vacsia ako 0");

        // Validacia CommissionRate (ak je vyplnena)
        RuleFor(o => o.CommissionRate)
            .InclusiveBetween(0.025m, 0.05m)
            .When(o => o.CommissionRate.HasValue)
            .WithMessage("Provizna sadzba musi byt 0.025 (2.5%) alebo 0.05 (5%)");

        // Validacia CommissionAmount (ak je vyplnena)
        RuleFor(o => o)
            .Must(o => !o.CommissionRate.HasValue || !o.CommissionAmount.HasValue ||
                o.CommissionAmount.Value == o.TotalPrice * o.CommissionRate.Value)
            .WithMessage("Provizna suma musi byt vypocitana ako TotalPrice * CommissionRate");

        RuleFor(o => o.Note)
            .MaximumLength(2000).WithMessage("Poznamka moze mat maximalne 2000 znakov");
    }
}
