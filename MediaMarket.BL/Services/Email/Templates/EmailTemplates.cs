using MediaMarket.DAL.Entities;
using MediaMarket.DAL.Enums;

namespace MediaMarket.BL.Services.Email.Templates;

public static class EmailTemplates
{
    public static string NewOrderForMedia(Order order)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset=""utf-8"">
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #4F46E5; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; background-color: #f9f9f9; }}
        .order-info {{ background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4F46E5; }}
        .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>Nova objednavka</h1>
        </div>
        <div class=""content"">
            <p>Dobry den {order.MediaUser.ContactName},</p>
            <p>Prisla nova objednavka na vasu ponuku <strong>{order.Offer.Title}</strong>.</p>
            
            <div class=""order-info"">
                <h3>Detaily objednavky:</h3>
                <p><strong>Cislo objednavky:</strong> {order.OrderNumber}</p>
                <p><strong>Objednavatel:</strong> {order.AgencyUser.CompanyName} ({order.AgencyUser.ContactName})</p>
                <p><strong>Celkova cena:</strong> {order.TotalPrice:N2} EUR</p>
                <p><strong>Preferovane datumy:</strong> {order.PreferredFrom:dd.MM.yyyy} - {order.PreferredTo:dd.MM.yyyy}</p>
                {(!string.IsNullOrEmpty(order.Note) ? $"<p><strong>Poznamka:</strong> {order.Note}</p>" : "")}
            </div>
            
            <p>Prosim overte objednavku v systeme a potvrdte ju.</p>
        </div>
        <div class=""footer"">
            <p>MediaMarket - Platforma pre media a agentury</p>
        </div>
    </div>
</body>
</html>";
    }

    public static string NewOrderForAgency(Order order)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset=""utf-8"">
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #10B981; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; background-color: #f9f9f9; }}
        .order-info {{ background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #10B981; }}
        .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>Objednavka potvrdena</h1>
        </div>
        <div class=""content"">
            <p>Dobry den {order.AgencyUser.ContactName},</p>
            <p>Vasa objednavka bola uspesne vytvorena a odoslana media partnerovi.</p>
            
            <div class=""order-info"">
                <h3>Detaily objednavky:</h3>
                <p><strong>Cislo objednavky:</strong> {order.OrderNumber}</p>
                <p><strong>Ponuka:</strong> {order.Offer.Title}</p>
                <p><strong>Media partner:</strong> {order.MediaUser.CompanyName}</p>
                <p><strong>Celkova cena:</strong> {order.TotalPrice:N2} EUR</p>
                <p><strong>Preferovane datumy:</strong> {order.PreferredFrom:dd.MM.yyyy} - {order.PreferredTo:dd.MM.yyyy}</p>
            </div>
            
            <p>Media partner vas bude kontaktovat ohledne dalsich krokov.</p>
        </div>
        <div class=""footer"">
            <p>MediaMarket - Platforma pre media a agentury</p>
        </div>
    </div>
</body>
</html>";
    }

    public static string StatusChangedForAgency(Order order, string oldStatus, string newStatus)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset=""utf-8"">
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #6366F1; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; background-color: #f9f9f9; }}
        .status-info {{ background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #6366F1; }}
        .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>Zmena statusu objednavky</h1>
        </div>
        <div class=""content"">
            <p>Dobry den {order.AgencyUser.ContactName},</p>
            <p>Status vasej objednavky sa zmenil.</p>
            
            <div class=""status-info"">
                <h3>Objednavka: {order.OrderNumber}</h3>
                <p><strong>Ponuka:</strong> {order.Offer.Title}</p>
                <p><strong>Stary status:</strong> {oldStatus}</p>
                <p><strong>Novy status:</strong> <strong>{newStatus}</strong></p>
                {(order.Status == OrderStatus.Closed && order.CommissionAmount.HasValue 
                    ? $"<p><strong>Provizia:</strong> {order.CommissionAmount.Value:N2} EUR ({order.CommissionRate * 100}%)</p>" 
                    : "")}
            </div>
        </div>
        <div class=""footer"">
            <p>MediaMarket - Platforma pre media a agentury</p>
        </div>
    </div>
</body>
</html>";
    }

    public static string StatusChangedForMedia(Order order, string oldStatus, string newStatus)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset=""utf-8"">
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #6366F1; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; background-color: #f9f9f9; }}
        .status-info {{ background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #6366F1; }}
        .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>Zmena statusu objednavky</h1>
        </div>
        <div class=""content"">
            <p>Dobry den {order.MediaUser.ContactName},</p>
            <p>Status objednavky sa zmenil.</p>
            
            <div class=""status-info"">
                <h3>Objednavka: {order.OrderNumber}</h3>
                <p><strong>Ponuka:</strong> {order.Offer.Title}</p>
                <p><strong>Objednavatel:</strong> {order.AgencyUser.CompanyName}</p>
                <p><strong>Stary status:</strong> {oldStatus}</p>
                <p><strong>Novy status:</strong> <strong>{newStatus}</strong></p>
            </div>
        </div>
        <div class=""footer"">
            <p>MediaMarket - Platforma pre media a agentury</p>
        </div>
    </div>
</body>
</html>";
    }

    public static string GetStatusText(OrderStatus status)
    {
        return status switch
        {
            OrderStatus.New => "Nova",
            OrderStatus.InProgress => "V reseni",
            OrderStatus.Closed => "Objednavka uzavrena",
            _ => status.ToString()
        };
    }

    public static string GetStatusText(string status)
    {
        return status switch
        {
            "New" => "Nova",
            "InProgress" => "V reseni",
            "Closed" => "Objednavka uzavrena",
            _ => status
        };
    }
}
