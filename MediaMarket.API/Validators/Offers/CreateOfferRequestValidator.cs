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

        RuleFor(x => x.MediaType)
            .IsInEnum().WithMessage("Neplatny typ media");

        RuleFor(x => x.PricingModel)
            .IsInEnum().WithMessage("Neplatny cenovy model");

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
