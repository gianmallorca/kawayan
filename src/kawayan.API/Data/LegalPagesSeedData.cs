using kawayan.API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace kawayan.API.Data;

public static class LegalPagesSeedData
{
    public static async Task SeedAsync(AppDbContext db)
    {
        if (await db.LegalPages.AnyAsync()) return;

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var pages = new[]
        {
            new LegalPage
            {
                Slug = "privacy-policy",
                Title = "Privacy Policy",
                LastRevised = today,
                IsPublished = true,
                UpdatedAt = DateTime.UtcNow,
                Body = """
                    This Privacy Policy describes how {{company_name}} ("we", "us") collects, uses, and protects personal information when you visit our website or contact us.

                    Information we collect
                    We may collect your name, email address, phone number, and any message you send through our contact form. We also collect basic technical data such as browser type and pages visited through standard server logs.

                    How we use information
                    We use your information to respond to inquiries, provide services you request, improve our website, and comply with legal obligations. We do not sell your personal information to third parties.

                    Cookies
                    Our website may use essential cookies required for basic functionality. If we add analytics tools in the future, we will update this policy and request consent where required.

                    Data retention
                    We retain contact submissions only as long as needed to handle your request and for reasonable business record-keeping.

                    Your rights
                    You may request access, correction, or deletion of your personal data by contacting us using the email address listed on our Contact page.

                    Contact
                    For privacy-related questions, please reach us through the contact details published on this website.
                    """,
            },
            new LegalPage
            {
                Slug = "terms",
                Title = "Terms of Service",
                LastRevised = today,
                IsPublished = true,
                UpdatedAt = DateTime.UtcNow,
                Body = """
                    These Terms of Service govern your use of the {{company_name}} website. By accessing this site, you agree to these terms.

                    Use of the website
                    You may browse this website for lawful purposes only. You must not attempt to disrupt the site, scrape content without permission, or use the site in any way that could harm us or other users.

                    Information on this site
                    Content on this website is provided for general information. Product descriptions, pricing, and availability may change without notice. Nothing on this site constitutes a binding offer until confirmed in writing by {{company_name}}.

                    Inquiries and orders
                    Messages submitted through our contact forms do not create a contract. We will confirm orders, quotes, and delivery terms separately.

                    Intellectual property
                    Text, images, logos, and other materials on this website are owned by {{company_name}} or used with permission. You may not copy or redistribute them without our prior written consent.

                    Limitation of liability
                    To the fullest extent permitted by law, {{company_name}} is not liable for indirect or consequential damages arising from your use of this website.

                    Governing law
                    These terms are governed by the laws of the Philippines unless otherwise required by applicable law.

                    Changes
                    We may update these terms from time to time. Continued use of the website after changes are posted constitutes acceptance of the revised terms.

                    Contact
                    Questions about these terms may be directed to us via the contact information on our Contact page.
                    """,
            },
            new LegalPage
            {
                Slug = "cookie-policy",
                Title = "Cookie Policy",
                LastRevised = today,
                IsPublished = true,
                UpdatedAt = DateTime.UtcNow,
                Body = """
                    This Cookie Policy explains how {{company_name}} uses cookies and similar technologies on our website.

                    What are cookies?
                    Cookies are small text files stored on your device when you visit a website. They help the site remember preferences and understand how visitors use pages.

                    Cookies we use
                    Essential cookies: required for basic site operation, such as keeping you signed in to the admin area or remembering security settings.
                    Analytics cookies: we only enable analytics if configured by our team. If enabled, they help us understand traffic patterns in aggregate.

                    Managing cookies
                    You can control cookies through your browser settings. Disabling essential cookies may affect how parts of the site work.

                    Updates
                    We may update this policy when our website tools change. The "Last revised" date at the top of this page shows when it was last updated.

                    Contact
                    Questions about cookies can be sent using the contact details on our Contact page.
                    """,
            },
        };

        db.LegalPages.AddRange(pages);
        await db.SaveChangesAsync();
    }
}
