using FluentValidation;
using MediaMarket.API.DTOs.Orders.Requests;

namespace MediaMarket.API.Validators.Orders;

public class CreateOrderRequestValidator : AbstractValidator<CreateOrderRequest>
{
    public CreateOrderRequestValidator()
    {
        RuleFor(x => x.OfferId)
            .NotEmpty().WithMessage("ID ponuky je povinne");

        RuleFor(x => x.PreferredTo)
            .GreaterThan(x => x.PreferredFrom).WithMessage("Datum do musi byt neskor ako datum od");

        RuleFor(x => x.QuantityUnits)
            .InclusiveBetween(1, 100).When(x => x.QuantityUnits.HasValue)
            .WithMessage("Pocet jednotiek musi byt medzi 1 a 100");

        RuleFor(x => x.Impressions)
            .GreaterThan(0).When(x => x.Impressions.HasValue)
            .WithMessage("Pocet impresii musi byt vacsi ako 0");

        RuleFor(x => x.Note)
            .MaximumLength(1000).WithMessage("Poznamka moze mat maximalne 1000 znakov");
    }
}
