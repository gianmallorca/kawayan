# kaw.a.yan

**kaw.a.yan** (Baybayin: ᜃᜏ᜔.ᜀᜌ᜔.ᜀᜈ᜔) is a company portfolio platform for bamboo suppliers and similar businesses. The public site showcases brand, services, articles, and contact details; the admin dashboard lets staff manage content without touching code.

Backend code, database names, and deployment identifiers use **kawayan**.

## Features

### Public site

- **Home** — hero, highlights, articles preview, mission & vision, stats, client testimonials, call-to-action
- **About** — company story, values, team
- **Services** — catalog with images and optional pricing
- **Articles** — published blog posts with author credits and image captions
- **Contact** — inquiry form with map and business hours
- **Legal** — privacy policy, terms of service, cookie policy (`{{company_name}}` is replaced at runtime)

### Admin dashboard (`/admin`)

- Company profile (Latin display name + Baybayin name, address, map coordinates, branding)
- Page section editor (home, about, services, contact)
- Services, articles, and media management
- Contact message inbox with export
- Legal page editor

Authentication uses JWT with role-based permissions (`content.manage`, `media.manage`).

## Tech stack

| Layer | Technology |
|-------|------------|
| API | ASP.NET Core 9, EF Core 9, SQL Server |
| Frontend | React 18, TypeScript, Vite 6, Tailwind CSS 4 |
| Auth | JWT + BCrypt |
| Maps | Leaflet / OpenStreetMap (Nominatim geocoding) |

The API serves the built React app from `wwwroot` and exposes REST endpoints under `/api`.

## Project structure

```
kawayan/
├── database/
│   └── deploy.sql          # Idempotent SQL deploy + seed data
├── src/
│   ├── kawayan.API/        # Backend, EF migrations, wwwroot host
│   └── kawayan.Web/        # React SPA source
└── kawayan.sln
```

Building the API project runs `npm ci` and `npm run build` in `kawayan.Web`, then copies the output into `kawayan.API/wwwroot`.

## Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/) (for frontend dev/build)
- SQL Server (LocalDB, Express, or remote instance)

## Local development

### 1. Configure the database

Update the connection string in `src/kawayan.API/appsettings.Development.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=...;Database=kawayan;Trusted_Connection=True;TrustServerCertificate=True"
}
```

In Development, the API applies EF migrations and runs seed data on startup by default.

Alternatively, run the unified deploy script (useful when EF CLI is unavailable or for hosted SQL):

```powershell
sqlcmd -S <server> -d kawayan -i database/deploy.sql
```

The script is idempotent — safe to re-run. It creates schema, migration history, and sample content (company profile, services, articles, page sections, legal pages, admin user).

### 2. Run the app

**Option A — single process (production-like)**

```powershell
cd src/kawayan.API
dotnet run
```

Open [http://localhost:5079](http://localhost:5079).

**Option B — hot reload frontend**

Terminal 1 (API):

```powershell
cd src/kawayan.API
dotnet run
```

Terminal 2 (Vite dev server, proxies `/api` and `/uploads` to port 5079):

```powershell
cd src/kawayan.Web
npm install
npm run dev
```

Open [http://localhost:5180](http://localhost:5180).

### Default admin accounts

| Source | Email | Password |
|--------|-------|----------|
| `database/deploy.sql` seed | `admin@kawayan.com` | `Admin123!` |
| `DbSeeder` (EF startup seed) | `admin@kawayan.test` | `Admin123!` |

Change these credentials before any public deployment.

## Configuration

| Setting | Description |
|---------|-------------|
| `ConnectionStrings:DefaultConnection` | SQL Server connection string |
| `Jwt:Key` | Signing key (minimum 32 characters) |
| `Jwt:Issuer` / `Jwt:Audience` | JWT validation |
| `Database:ApplyMigrationsOnStartup` | Run EF migrations on startup (default `true` in Development) |
| `Database:SeedOnStartup` | Run C# seed data on startup (default `true` in Development) |

On hosted platforms (e.g. MonsterASP), set these as environment variables using `__` as the section separator (`ConnectionStrings__DefaultConnection`, `Jwt__Key`, etc.).

## Database

### EF Core migrations

Migrations live in `src/kawayan.API/Migrations/`.

```powershell
cd src/kawayan.API
dotnet ef migrations add <Name>
dotnet ef database update
```

Regenerate the idempotent SQL script:

```powershell
dotnet ef migrations script --idempotent -p src/kawayan.API -o database/deploy.sql
```

After regenerating, re-apply any hand-maintained seed blocks in `deploy.sql` (STEP 7 and STEP 14) if needed.

### Seed data

Content can come from two paths:

1. **`database/deploy.sql`** — SQL-only deploy with company profile, services, articles, page sections, legal pages, and admin user
2. **`KawayanSeedData.cs` / `LegalPagesSeedData.cs`** — C# seeds run when `Database:SeedOnStartup` is enabled

Both paths are idempotent and skip rows that already exist.

## Publish

```powershell
dotnet publish src/kawayan.API/kawayan.API.csproj -c Release -o ./publish
```

To skip the frontend build (e.g. CI already built assets):

```powershell
dotnet publish src/kawayan.API/kawayan.API.csproj -c Release -p:SkipSpaBuild=true
```

User uploads in `wwwroot/uploads` are excluded from publish and created at runtime on the server.

## API overview

| Controller | Purpose |
|------------|---------|
| `AuthController` | Login, refresh tokens |
| `CompanyDetailsController` | Public and admin company profile |
| `HomeContentController` | Page section JSON by page |
| `ServicesController` | Service catalog |
| `ArticlesController` | Published articles |
| `InquiriesController` | Contact form submissions |
| `LegalPagesController` | Legal page  |
| `MediaController` | File uploads |
| `PageHeadersController` | Per-page hero images |

## License

Proprietary — all rights reserved unless otherwise noted by the repository owner.
