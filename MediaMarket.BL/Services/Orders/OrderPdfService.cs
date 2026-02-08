using MediaMarket.DAL.Entities;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace MediaMarket.BL.Services.Orders;

public class OrderPdfService
{
    public byte[] GenerateOrderPdf(Order order)
    {
        QuestPDF.Settings.License = LicenseType.Community;
        
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header()
                    .Column(column =>
                    {
                        column.Item().Text("OBJEDNÁVKA").FontSize(20).Bold().FontColor(Colors.Blue.Medium);
                        column.Item().Text($"Číslo objednávky: {order.OrderNumber}").FontSize(12).FontColor(Colors.Grey.Darken1);
                        column.Item().PaddingBottom(10);
                    });

                page.Content()
                    .PaddingVertical(1, Unit.Centimetre)
                    .Column(column =>
                    {
                        // Informácie o objednávke
                        column.Item().Text("Informácie o objednávke").FontSize(14).Bold().PaddingBottom(5);
                        column.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(2);
                                columns.RelativeColumn(3);
                            });

                            table.Cell().Element(CellStyle).Text("Ponuka:");
                            table.Cell().Element(CellStyle).Text(order.Offer?.Title ?? "N/A");

                            table.Cell().Element(CellStyle).Text("Médium:");
                            table.Cell().Element(CellStyle).Text(order.MediaUser?.CompanyName ?? "N/A");

                            table.Cell().Element(CellStyle).Text("Agentúra:");
                            table.Cell().Element(CellStyle).Text(order.AgencyUser?.CompanyName ?? "N/A");

                            table.Cell().Element(CellStyle).Text("Kontakt (Agentúra):");
                            table.Cell().Element(CellStyle).Text(order.AgencyUser?.ContactName ?? "N/A");

                            table.Cell().Element(CellStyle).Text("Status:");
                            table.Cell().Element(CellStyle).Text(GetStatusText(order.Status));

                            table.Cell().Element(CellStyle).Text("Dátum vytvorenia:");
                            table.Cell().Element(CellStyle).Text(order.CreatedAt.ToString("dd.MM.yyyy HH:mm"));
                        });

                        column.Item().PaddingTop(15);

                        // Preferované dátumy
                        column.Item().Text("Preferované dátumy").FontSize(14).Bold().PaddingBottom(5);
                        column.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(2);
                                columns.RelativeColumn(3);
                            });

                            table.Cell().Element(CellStyle).Text("Od:");
                            table.Cell().Element(CellStyle).Text(order.PreferredFrom.ToString("dd.MM.yyyy"));

                            table.Cell().Element(CellStyle).Text("Do:");
                            table.Cell().Element(CellStyle).Text(order.PreferredTo.ToString("dd.MM.yyyy"));
                        });

                        column.Item().PaddingTop(15);

                        // Cenové informácie
                        column.Item().Text("Cenové informácie").FontSize(14).Bold().PaddingBottom(5);
                        column.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(2);
                                columns.RelativeColumn(3);
                            });

                            table.Cell().Element(CellStyle).Text("Cenový model:");
                            table.Cell().Element(CellStyle).Text(GetPricingModelText(order.PricingModelSnapshot));

                            if (order.PricingModelSnapshot == DAL.Enums.PricingModel.UnitPrice && order.UnitPriceSnapshot.HasValue)
                            {
                                table.Cell().Element(CellStyle).Text("Cena za ks:");
                                table.Cell().Element(CellStyle).Text($"{order.UnitPriceSnapshot.Value:N2} EUR");

                                if (order.QuantityUnits.HasValue)
                                {
                                    table.Cell().Element(CellStyle).Text("Počet ks:");
                                    table.Cell().Element(CellStyle).Text(order.QuantityUnits.Value.ToString());
                                }
                            }
                            else if (order.PricingModelSnapshot == DAL.Enums.PricingModel.Cpt && order.CptSnapshot.HasValue)
                            {
                                table.Cell().Element(CellStyle).Text("CPT (za 1000 zobrazení):");
                                table.Cell().Element(CellStyle).Text($"{order.CptSnapshot.Value:N2} EUR");

                                if (order.Impressions.HasValue)
                                {
                                    table.Cell().Element(CellStyle).Text("Počet zobrazení:");
                                    table.Cell().Element(CellStyle).Text($"{order.Impressions.Value:N0}");
                                }
                            }

                            table.Cell().Element(CellStyle).Text("Celková cena:");
                            table.Cell().Element(CellStyle).Text($"{order.TotalPrice:N2} EUR").Bold();
                        });

                        // Provízia (ak je uzavretá objednávka)
                        if (order.Status == DAL.Enums.OrderStatus.Closed && order.CommissionAmount.HasValue)
                        {
                            column.Item().PaddingTop(15);
                            column.Item().Text("Provízia").FontSize(14).Bold().PaddingBottom(5);
                            column.Item().Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.RelativeColumn(2);
                                    columns.RelativeColumn(3);
                                });

                                table.Cell().Element(CellStyle).Text("Provízna sadzba:");
                                table.Cell().Element(CellStyle).Text(order.CommissionRate.HasValue 
                                    ? $"{(order.CommissionRate.Value * 100):N1}%" 
                                    : "N/A");

                                table.Cell().Element(CellStyle).Text("Provízna suma:");
                                table.Cell().Element(CellStyle).Text($"{order.CommissionAmount.Value:N2} EUR").Bold();
                            });
                        }

                        // Poznámka
                        if (!string.IsNullOrWhiteSpace(order.Note))
                        {
                            column.Item().PaddingTop(15);
                            column.Item().Text("Poznámka").FontSize(14).Bold().PaddingBottom(5);
                            column.Item().Text(order.Note).FontSize(10);
                        }
                    });

                page.Footer()
                    .AlignCenter()
                    .Text(x =>
                    {
                        x.Span("Vygenerované: ");
                        x.Span(DateTime.UtcNow.ToString("dd.MM.yyyy HH:mm")).FontColor(Colors.Grey.Medium);
                    });
            });
        })
        .GeneratePdf();
    }

    private static IContainer CellStyle(IContainer container)
    {
        return container
            .BorderBottom(1)
            .BorderColor(Colors.Grey.Lighten2)
            .PaddingVertical(5)
            .PaddingHorizontal(5);
    }

    private static string GetStatusText(DAL.Enums.OrderStatus status)
    {
        return status switch
        {
            DAL.Enums.OrderStatus.New => "Nová",
            DAL.Enums.OrderStatus.InProgress => "V řešení",
            DAL.Enums.OrderStatus.Closed => "Objednávka uzavřena",
            _ => status.ToString()
        };
    }

    private static string GetPricingModelText(DAL.Enums.PricingModel model)
    {
        return model switch
        {
            DAL.Enums.PricingModel.UnitPrice => "Cena za ks",
            DAL.Enums.PricingModel.Cpt => "CPT (cena za tisíc zobrazení)",
            _ => model.ToString()
        };
    }
}
