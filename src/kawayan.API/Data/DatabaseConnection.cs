namespace kawayan.API.Data;

public static class DatabaseConnection
{
    public static string Resolve(IConfiguration configuration)
    {
        var fromConfig = configuration.GetConnectionString("DefaultConnection");
        if (!string.IsNullOrWhiteSpace(fromConfig))
            return fromConfig;

        var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
        if (!string.IsNullOrWhiteSpace(databaseUrl))
            return FromDatabaseUrl(databaseUrl);

        throw new InvalidOperationException(
            "ConnectionStrings:DefaultConnection is not configured. " +
            "Set ConnectionStrings__DefaultConnection or DATABASE_URL (Railway PostgreSQL).");
    }

    internal static string FromDatabaseUrl(string databaseUrl)
    {
        var uri = new Uri(databaseUrl);
        var userInfo = uri.UserInfo.Split(':', 2);
        var username = Uri.UnescapeDataString(userInfo[0]);
        var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : string.Empty;
        var database = uri.AbsolutePath.TrimStart('/');

        return $"Host={uri.Host};Port={uri.Port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true";
    }
}
