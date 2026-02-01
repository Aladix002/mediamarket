namespace MediaMarket.DAL.Enums;

[Flags]
public enum OfferTag
{
    None = 0,
    Akce = 1,
    Special = 2,
    LastMinute = 4
}
