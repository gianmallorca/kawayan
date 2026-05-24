using System.Text.Json;
using kawayan.API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace kawayan.API.Data;

public static class KawayanSeedData
{
    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public static async Task SeedAsync(AppDbContext db)
    {
        await SeedCompanyAsync(db);
        await SeedServicesAsync(db);
        await SeedPageSectionsAsync(db);
    }

    private static async Task SeedCompanyAsync(AppDbContext db)
    {
        var existing = await db.CompanyDetails.FindAsync(1);
        if (existing is not null && existing.NameMain is not ("Your Company" or "kawayan" or "BambooSource Co.") && existing.PrimaryColor != "#2563eb")
            return;
        if (existing?.NameMain is "kawayan" or "BambooSource Co." &&
            !string.IsNullOrEmpty(existing.CoverImageUrl) &&
            existing.Latitude.HasValue &&
            existing.Longitude.HasValue &&
            !string.IsNullOrWhiteSpace(existing.City))
            return;

        var company = existing ?? new CompanyDetails { Id = 1 };
        company.NameMain = "kawayan";
        company.NameBaybayin = "ᜃᜏᜌᜈ᜔";
        company.Tagline = "Crafted with care. Built to grow.";
        company.ShortDescription =
            "A modern company portfolio platform — showcase your brand, services, blogs, and story in one place.";
        company.FullDescription =
            "kawayan helps businesses present a polished online presence with editable pages, services, testimonials, and contact tools. Launch quickly, update content from admin, and keep your story consistent across every page.";
        company.EstablishedYear = 2020;
        company.Email = "hello@kawayan.ph";
        company.Phone = "+63 912 345 6789";
        company.Street = "123 Kawayan Street";
        company.Barangay = "";
        company.City = "Cagayan de Oro";
        company.Province = "Misamis Oriental";
        company.Region = "Northern Mindanao";
        company.Country = "Philippines";
        company.PostalCode = "9000";
        company.Latitude = 8.484722m;
        company.Longitude = 124.647222m;
        company.Website = "www.kawayan.ph";
        company.PrimaryColor = "#4A7C59";
        company.CoverImageUrl = "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1600&h=900&fit=crop";
        company.AboutImageUrl = "https://images.unsplash.com/photo-1598900384379-02b0883e4952?w=800&h=600&fit=crop";
        company.SocialLinksJson = JsonSerializer.Serialize(new Dictionary<string, string>
        {
            ["facebook"] = "https://facebook.com/kawayan",
            ["instagram"] = "https://instagram.com/kawayan"
        });
        company.UpdatedAt = DateTime.UtcNow;

        if (existing is null) db.CompanyDetails.Add(company);
        await db.SaveChangesAsync();
    }

    private static async Task SeedServicesAsync(AppDbContext db)
    {
        if (await db.Services.AnyAsync()) return;

        var services = new[]
        {
            ("Brand & Web Design", "Logo, color system, and responsive site design aligned with your company story and goals.", "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop"),
            ("Content & Blogs", "Plan, write, and publish articles with images, credits, and SEO-friendly structure.", "https://images.unsplash.com/photo-1456324504439-367cee3b3b32?w=600&h=400&fit=crop"),
            ("Services Showcase", "Highlight offerings with images, descriptions, and optional pricing on your public site.", "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop"),
            ("Contact & Inquiries", "Capture leads through your contact form with admin review and export tools.", "https://images.unsplash.com/photo-1423666639043-f560bc8f0b8a?w=600&h=400&fit=crop"),
            ("Admin Dashboard", "Manage company details, page sections, media, legal pages, and team content in one place.", "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop"),
            ("Launch & Support", "Deployment guidance, training, and ongoing updates so your portfolio stays current.", "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop")
        };

        foreach (var (title, desc, image) in services)
        {
            db.Services.Add(new ServiceItem
            {
                Title = title,
                Description = desc,
                ImageUrl = image,
            });
        }

        await db.SaveChangesAsync();
    }

    private static async Task SeedPageSectionsAsync(AppDbContext db)
    {
        var sections = new (string Page, string Key, object Content)[]
        {
            ("home", "hero", new
            {
                subtext = "Showcase your company with a fast, editable portfolio — services, blogs, testimonials, and more.",
                ctaPrimary = "View Services",
                ctaPrimaryLink = "/services",
                ctaSecondary = "Contact Us",
                ctaSecondaryLink = "/contact"
            }),
            ("home", "whyChooseUs", new
            {
                cards = new[]
                {
                    new { icon = "✨", title = "Polished Presence", body = "A cohesive public site with brand colors, imagery, and clear calls to action." },
                    new { icon = "🛠️", title = "Easy to Manage", body = "Update copy, services, and blogs from admin without touching code." },
                    new { icon = "📱", title = "Mobile Ready", body = "Layouts tuned for phones and tablets so visitors get a great experience everywhere." }
                }
            }),
            ("home", "products", new
            {
                items = new[]
                {
                    new { name = "Brand & Web", desc = "Identity and site design that reflect who you are.", tag = "Popular", imageUrl = "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop" },
                    new { name = "Blogs", desc = "Publish stories, updates, and insights with rich media.", tag = "Content", imageUrl = "https://images.unsplash.com/photo-1456324504439-367cee3b3b32?w=400&h=300&fit=crop" },
                    new { name = "Services", desc = "Present what you offer with images and optional pricing.", tag = "Showcase", imageUrl = "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop" },
                    new { name = "Support", desc = "Launch help and ongoing updates when you need them.", tag = "Care", imageUrl = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop" }
                }
            }),
            ("home", "missionVision", MissionVisionContent()),
            ("home", "stats", new
            {
                items = new[]
                {
                    new { value = "5+", label = "Years Experience" },
                    new { value = "120+", label = "Projects Launched" },
                    new { value = "40+", label = "Active Clients" },
                    new { value = "24/7", label = "Admin Access" }
                }
            }),
            ("home", "testimonials", new
            {
                items = new[]
                {
                    new { quote = "kawayan gave us a professional site we could update ourselves — exactly what we needed.", name = "Marco R.", role = "Business Owner, Bukidnon" },
                    new { quote = "Clean design, fast setup, and the blogs feature works great for our announcements.", name = "Lena C.", role = "Marketing Lead, CDO" },
                    new { quote = "Our services page and contact form brought in more inquiries within the first month.", name = "Rey T.", role = "Operations Manager, Misamis Oriental" }
                }
            }),
            ("home", "cta", CtaContent()),
            ("about", "hero", new
            {
                headline = "About kawayan",
                subtext = "A portfolio platform rooted in clarity, craft, and growth."
            }),
            ("about", "story", new
            {
                paragraphs = new[]
                {
                    "kawayan was built to help teams launch a credible online presence without a long custom build. From company details to services, blogs, and legal pages, everything lives in one manageable system.",
                    "We believe your story should be easy to tell and easy to update — so you can focus on your work while your site stays fresh and trustworthy."
                }
            }),
            ("about", "missionVision", MissionVisionContent()),
            ("about", "values", new
            {
                cards = new[]
                {
                    new { icon = "🎯", title = "Clarity", body = "Straightforward content structure so visitors find what they need quickly." },
                    new { icon = "🤝", title = "Trust", body = "Honest presentation of your brand, services, and contact details." },
                    new { icon = "⚙️", title = "Quality", body = "Thoughtful defaults and admin tools that respect your time." },
                    new { icon = "🌱", title = "Growth", body = "Room to expand with new services, articles, and page sections as you scale." }
                }
            }),
            ("about", "team", new
            {
                members = new[]
                {
                    new { initials = "KM", name = "Kai Mendoza", role = "Founder", bio = "Leads product direction and helps clients shape their portfolio content." },
                    new { initials = "AL", name = "Ana Lim", role = "Design Lead", bio = "Ensures every public page feels on-brand and accessible on all devices." },
                    new { initials = "JR", name = "Jason Reyes", role = "Technical Lead", bio = "Handles deployment, integrations, and platform reliability." }
                }
            }),
            ("services", "hero", new
            {
                headline = "What We Offer",
                subtext = "Tools and services to launch and maintain your company portfolio."
            }),
            ("services", "cta", CtaContent()),
            ("contact", "hero", new
            {
                headline = "Get in Touch",
                subtext = "Questions, quotes, or a demo — we are happy to help."
            }),
            ("contact", "details", new
            {
                hours = new[] { "Monday – Friday: 9:00 AM – 6:00 PM", "Saturday: 10:00 AM – 2:00 PM", "Sunday: Closed" }
            })
        };

        foreach (var (page, key, content) in sections)
        {
            if (await db.PageSections.AnyAsync(s => s.Page == page && s.SectionKey == key)) continue;
            db.PageSections.Add(new PageSection
            {
                Page = page,
                SectionKey = key,
                ContentJson = JsonSerializer.Serialize(content, JsonOpts)
            });
        }

        await db.SaveChangesAsync();
    }

    private static object MissionVisionContent() => new
    {
        mission = "We empower businesses to present a clear, credible online presence — with tools to manage content, services, and customer inquiries in one place.",
        vision = "To be the go-to portfolio platform for growing companies that value craft, transparency, and lasting client relationships."
    };

    private static object CtaContent() => new
    {
        headline = "Ready to grow your presence?",
        subtext = "Reach out for a conversation about your site, content, or launch plan.",
        buttonText = "Contact Us",
        buttonLink = "/contact"
    };
}
