using MediaMarket.BL.Interfaces;
using MediaMarket.BL.Services.Email.Templates;
using MediaMarket.DAL.Entities;
using System.Net.Http.Json;
using System.Text.Json;

namespace MediaMarket.BL.Services.Email;

public class EmailService : IEmailService
{
    private readonly HttpClient _httpClient;
    private readonly string _resendApiKey;
    private readonly string _fromEmail;
    private readonly string _fromName;
    private const string ResendApiUrl = "https://api.resend.com/emails";

    public EmailService(HttpClient httpClient, string resendApiKey, string fromEmail, string fromName)
    {
        _httpClient = httpClient;
        _resendApiKey = resendApiKey;
        _fromEmail = fromEmail;
        _fromName = fromName;
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_resendApiKey}");
    }

    public async Task<bool> SendNewOrderNotificationAsync(Order order)
    {
        try
        {
            // Email pre Media (vlastnik ponuky)
            var mediaEmailBody = EmailTemplates.NewOrderForMedia(order);
            await SendEmailAsync(
                to: order.MediaUser.Email,
                subject: $"Nova objednavka: {order.OrderNumber}",
                htmlBody: mediaEmailBody
            );

            // Email pre Agency (objednavatel)
            var agencyEmailBody = EmailTemplates.NewOrderForAgency(order);
            await SendEmailAsync(
                to: order.AgencyUser.Email,
                subject: $"Potvrdenie objednavky: {order.OrderNumber}",
                htmlBody: agencyEmailBody
            );

            return true;
        }
        catch
        {
            // Log error, ale nech aplikacia pokracuje
            return false;
        }
    }

    public async Task<bool> SendOrderStatusChangedNotificationAsync(Order order, string oldStatus)
    {
        try
        {
            var statusText = EmailTemplates.GetStatusText(order.Status);
            var oldStatusText = EmailTemplates.GetStatusText(oldStatus);

            // Email pre Agency
            var agencyEmailBody = EmailTemplates.StatusChangedForAgency(order, oldStatusText, statusText);
            await SendEmailAsync(
                to: order.AgencyUser.Email,
                subject: $"Zmena statusu objednavky {order.OrderNumber}",
                htmlBody: agencyEmailBody
            );

            // Email pre Media
            var mediaEmailBody = EmailTemplates.StatusChangedForMedia(order, oldStatusText, statusText);
            await SendEmailAsync(
                to: order.MediaUser.Email,
                subject: $"Zmena statusu objednavky {order.OrderNumber}",
                htmlBody: mediaEmailBody
            );

            return true;
        }
        catch
        {
            return false;
        }
    }

    private async Task SendEmailAsync(string to, string subject, string htmlBody)
    {
        var payload = new
        {
            from = $"{_fromName} <{_fromEmail}>",
            to = new[] { to },
            subject = subject,
            html = htmlBody
        };

        var response = await _httpClient.PostAsJsonAsync(ResendApiUrl, payload);
        response.EnsureSuccessStatusCode();
    }
}
