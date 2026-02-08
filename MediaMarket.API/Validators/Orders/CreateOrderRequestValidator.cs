using FluentValidation;
using MediaMarket.API.DTOs.Orders.Requests;
using MediaMarket.DAL.Enums;

namespace MediaMarket.API.Validators.Orders;

public class CreateOrderRequestValidator : AbstractValidator<CreateOrderRequest>
{
    public CreateOrderRequestValidator()
    {
        RuleFor(x => x.OfferId)
            .NotEmpty().WithMessage("ID ponuky je povinne");

        RuleFor(x => x.PreferredFrom)
            .NotEmpty().WithMessage("Datum od je povinny")
            .GreaterThanOrEqualTo(DateTime.UtcNow.Date)
            .WithMessage("Datum od nemoze byt skor ako dnes");

        RuleFor(x => x.PreferredTo)
            .NotEmpty().WithMessage("Datum do je povinny")
            .GreaterThanOrEqualTo(x => x.PreferredFrom).WithMessage("Datum do musi byt stejny nebo neskor ako datum od");

        RuleFor(x => x.QuantityUnits)
            .InclusiveBetween(1, 100).When(x => x.QuantityUnits.HasValue)
            .WithMessage("Pocet jednotiek musi byt medzi 1 a 100");

        RuleFor(x => x.Impressions)
            .GreaterThan(0).When(x => x.Impressions.HasValue)
            .WithMessage("Pocet impresii musi byt vacsi ako 0");

        RuleFor(x => x.Note)
            .MaximumLength(2000).WithMessage("Poznamka moze mat maximalne 2000 znakov");

        // Validacia: musi byt vyplneny QuantityUnits alebo Impressions (a musi byt > 0)
        RuleFor(x => x)
            .Must(x => (x.QuantityUnits.HasValue && x.QuantityUnits.Value > 0) || 
                       (x.Impressions.HasValue && x.Impressions.Value > 0))
            .WithMessage("Musite vyplnit bud pocet jednotiek (1-100) alebo pocet impresii (vacsi ako 0)");
    }
}
