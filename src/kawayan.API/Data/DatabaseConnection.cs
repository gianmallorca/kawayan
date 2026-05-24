namespace kawayan.API.Data;

public static class DatabaseConnection
{
    public static string Resolve(IConfiguration configuration)
    {
        var fromConfig = configuration.GetConnectionString("DefaultConnection");
        if (!string.IsNullOrWhiteSpace(fromConfig))
            return fromConfig.Trim();

        var databaseUrl = FirstNonEmpty(
            configuration["DATABASE_URL"],
            configuration["DATABASE_PUBLIC_URL"],
            Environment.GetEnvironmentVariable("DATABASE_URL"),
            Environment.GetEnvironmentVariable("DATABASE_PUBLIC_URL"));

        if (!string.IsNullOrWhiteSpace(databaseUrl))
        {
            databaseUrl = databaseUrl.Trim().Trim('"');
            if (databaseUrl.Contains("${{", StringComparison.Ordinal))
            {
                throw new InvalidOperationException(
                    "DATABASE_URL contains unresolved Railway template syntax. " +
                    "On the kawayan service use Add Reference → Postgres → DATABASE_URL, " +
                    "or set DATABASE_URL=${{YourPostgresServiceName.DATABASE_URL}}.");
            }

            return FromDatabaseUrl(databaseUrl);
        }

        var fromParts = FromPostgresEnvVars(configuration);
        if (fromParts is not null)
            return fromParts;

        throw new InvalidOperationException(
            "ConnectionStrings:DefaultConnection is not configured. " +
            "On Railway: kawayan service → Variables → Add Reference → Postgres → DATABASE_URL. " +
            "Or set ConnectionStrings__DefaultConnection / DATABASE_URL / PGHOST+PGUSER+PGDATABASE.");
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

        var connectionString =
            $"Host={host};Port={port};Database={database};Username={user};Password={password};SSL Mode=Require;Trust Server Certificate=true";
        return connectionString;
    }

    internal static string FromDatabaseUrl(string databaseUrl)
    {
        if (!databaseUrl.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase)
            && !databaseUrl.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        {
            databaseUrl = "postgresql://" + databaseUrl.TrimStart('/');
        }

        var uri = new Uri(databaseUrl);
        var userInfo = uri.UserInfo.Split(':', 2);
        var username = Uri.UnescapeDataString(userInfo[0]);
        var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : string.Empty;
        var database = uri.AbsolutePath.TrimStart('/');

        return $"Host={uri.Host};Port={uri.Port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true";
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
