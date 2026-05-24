namespace kawayan.API.Data;

public static class DatabaseConnection
{
    public static string Resolve(IConfiguration configuration)
    {
        var fromConfig = FirstNonEmpty(
            configuration.GetConnectionString("DefaultConnection"),
            configuration["ConnectionStrings:DefaultConnection"],
            Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection"));
        if (!string.IsNullOrWhiteSpace(fromConfig))
            return fromConfig.Trim();

        var databaseUrl = ResolveDatabaseUrl(configuration);

        if (!string.IsNullOrWhiteSpace(databaseUrl))
        {
            databaseUrl = databaseUrl.Trim().Trim('"');
            if (databaseUrl.Contains("${{", StringComparison.Ordinal))
            {
                throw new InvalidOperationException(
                    "DATABASE_URL contains unresolved Railway template syntax. " +
                    "Paste the resolved DATABASE_PUBLIC_URL from Postgres → Variables on the kawayan service.");
            }

            var host = new Uri(NormalizeDatabaseUrl(databaseUrl)).Host;
            Console.Error.WriteLine($"[kawayan] database host: {host}");

            return FromDatabaseUrl(databaseUrl);
        }

        var fromParts = FromPostgresEnvVars(configuration);
        if (fromParts is not null)
            return fromParts;

        LogMissingConfigDiagnostics();

        throw new InvalidOperationException(
            "Database connection is not configured on this service. " +
            "Railway: open the kawayan service (not Postgres) → Variables → New Variable → " +
            "Add Reference → pick your Postgres service → DATABASE_URL. " +
            "Service name in the reference must match exactly (e.g. Postgres vs PostgreSQL). " +
            "Also set Jwt__Key (≥32 chars). See .env.example.");
    }

    private static string? ResolveDatabaseUrl(IConfiguration configuration)
    {
        var databaseUrl = FirstNonEmpty(
            configuration["DATABASE_URL"],
            Environment.GetEnvironmentVariable("DATABASE_URL"));
        var publicUrl = FirstNonEmpty(
            configuration["DATABASE_PUBLIC_URL"],
            Environment.GetEnvironmentVariable("DATABASE_PUBLIC_URL"));

        // Railway internal DNS often fails when DATABASE_URL was typed manually.
        if (UsesRailwayInternalHost(databaseUrl) && !string.IsNullOrWhiteSpace(publicUrl))
        {
            Console.Error.WriteLine("[kawayan] DATABASE_PUBLIC_URL preferred over unreachable .railway.internal host.");
            return publicUrl;
        }

        return FirstNonEmpty(databaseUrl, publicUrl);
    }

    private static bool UsesRailwayInternalHost(string? databaseUrl)
    {
        if (string.IsNullOrWhiteSpace(databaseUrl)) return false;
        try
        {
            return new Uri(NormalizeDatabaseUrl(databaseUrl.Trim().Trim('"'))).Host
                .EndsWith(".railway.internal", StringComparison.OrdinalIgnoreCase);
        }
        catch
        {
            return databaseUrl.Contains(".railway.internal", StringComparison.OrdinalIgnoreCase);
        }
    }

    private static string NormalizeDatabaseUrl(string databaseUrl)
    {
        if (!databaseUrl.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase)
            && !databaseUrl.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        {
            return "postgresql://" + databaseUrl.TrimStart('/');
        }

        return databaseUrl;
    }
    private static void LogMissingConfigDiagnostics()
    {
        var keys = new[]
        {
            "ConnectionStrings__DefaultConnection",
            "DATABASE_URL",
            "DATABASE_PUBLIC_URL",
            "PGHOST",
            "PGUSER",
            "PGPASSWORD",
            "PGDATABASE",
            "POSTGRES_USER",
            "POSTGRES_PASSWORD",
            "POSTGRES_DB"
        };

        foreach (var key in keys)
        {
            var set = !string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable(key));
            Console.Error.WriteLine($"[kawayan] env {key}: {(set ? "set" : "missing")}");
        }
    }

    private static string? FromPostgresEnvVars(IConfiguration configuration)
    {
        var host = FirstNonEmpty(configuration["PGHOST"], Environment.GetEnvironmentVariable("PGHOST"));
        var port = FirstNonEmpty(configuration["PGPORT"], Environment.GetEnvironmentVariable("PGPORT")) ?? "5432";
        var user = FirstNonEmpty(
            configuration["PGUSER"],
            configuration["POSTGRES_USER"],
            Environment.GetEnvironmentVariable("PGUSER"),
            Environment.GetEnvironmentVariable("POSTGRES_USER"));
        var password = FirstNonEmpty(
            configuration["PGPASSWORD"],
            configuration["POSTGRES_PASSWORD"],
            Environment.GetEnvironmentVariable("PGPASSWORD"),
            Environment.GetEnvironmentVariable("POSTGRES_PASSWORD"));
        var database = FirstNonEmpty(
            configuration["PGDATABASE"],
            configuration["POSTGRES_DB"],
            Environment.GetEnvironmentVariable("PGDATABASE"),
            Environment.GetEnvironmentVariable("POSTGRES_DB"));

        if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(user) || string.IsNullOrWhiteSpace(database))
            return null;

        var isInternal = host.EndsWith(".railway.internal", StringComparison.OrdinalIgnoreCase);
        var ssl = isInternal ? "SSL Mode=Disable" : "SSL Mode=Require;Trust Server Certificate=true";

        var connectionString =
            $"Host={host};Port={port};Database={database};Username={user};Password={password};{ssl}";
        return connectionString;
    }

    internal static string FromDatabaseUrl(string databaseUrl)
    {
        databaseUrl = NormalizeDatabaseUrl(databaseUrl);
        var uri = new Uri(databaseUrl);
        var userInfo = uri.UserInfo.Split(':', 2);
        var username = Uri.UnescapeDataString(userInfo[0]);
        var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : string.Empty;
        var database = uri.AbsolutePath.TrimStart('/');

        var isInternal = uri.Host.EndsWith(".railway.internal", StringComparison.OrdinalIgnoreCase);
        var ssl = isInternal ? "SSL Mode=Disable" : "SSL Mode=Require;Trust Server Certificate=true";

        return $"Host={uri.Host};Port={uri.Port};Database={database};Username={username};Password={password};{ssl}";
    }

    private static string? FirstNonEmpty(params string?[] values)
    {
        foreach (var value in values)
        {
            if (!string.IsNullOrWhiteSpace(value))
                return value;
        }

        return null;
    }
}
