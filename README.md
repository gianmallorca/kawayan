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
| API | ASP.NET Core 9, EF Core 9, PostgreSQL |
| Frontend | React 18, TypeScript, Vite 6, Tailwind CSS 4 |
| Auth | JWT + BCrypt |
| Maps | Leaflet / OpenStreetMap (Nominatim geocoding) |

The API serves the built React app from `wwwroot` and exposes REST endpoints under `/api`.

## Project structure

```
kawayan/
├── database/
│   ├── deploy.sql          # PostgreSQL deploy + seed (idempotent)
│   └── deploy.sqlserver.sql # Legacy SQL Server script (archived)
├── Dockerfile              # Railway / container build
├── railway.toml            # Railway deploy settings
├── .env                    # Local secrets (gitignored)
├── src/
│   ├── kawayan.API/        # Backend, EF migrations, wwwroot host
│   └── kawayan.Web/        # React SPA source
└── kawayan.sln
```

Building the API project runs `npm ci` and `npm run build` in `kawayan.Web`, then copies the output into `kawayan.API/wwwroot`.

## Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/) (for frontend dev/build)
- [PostgreSQL 16+](https://www.postgresql.org/download/) (local dev, or use Railway PostgreSQL in production)

## Local development

### 1. Configure the database

Install PostgreSQL locally, create a database, then update `src/kawayan.API/appsettings.Development.json` (gitignored) or use the default in `appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=kawayan_dev;Username=postgres;Password=postgres"
}
```

In Development, the API applies EF migrations and runs seed data on startup by default.

```powershell
cd src/kawayan.API
dotnet ef database update
```

Or run the SQL deploy script against PostgreSQL (Railway Query tab or `psql`):

```powershell
psql "$DATABASE_URL" -f database/deploy.sql
```

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

### Default admin account (deploy.sql seed)

| Email | Password |
|-------|----------|
| `admin@kawayan.com` | `Admin123!` |

EF startup seed (`DbSeeder`) uses `admin@kawayan.test` / `Admin123!` if `Database__SeedOnStartup=true` instead.

## Configuration

| Setting | Description |
|---------|-------------|
| `ConnectionStrings:DefaultConnection` | PostgreSQL connection string (Npgsql format) |
| `DATABASE_URL` | Alternative — Railway sets this automatically when PostgreSQL is linked |
| `Jwt:Key` | Signing key (minimum 32 characters) |
| `Jwt:Issuer` / `Jwt:Audience` | JWT validation |
| `Database:ApplyMigrationsOnStartup` | Run EF migrations on startup (default `true` in Development) |
| `Database:SeedOnStartup` | Run C# seed data on startup (default `true` in Development) |

On hosted platforms (Railway, MonsterASP, etc.), set these as environment variables using `__` as the section separator (`ConnectionStrings__DefaultConnection`, `Jwt__Key`, etc.). Keep real values in a local `.env` file (gitignored) or your host’s variable panel.

## Deploy to Railway (PostgreSQL)

Railway hosts the app **and** PostgreSQL on the same private network — no external SQL firewall issues.

### 1. Add PostgreSQL on Railway

1. Railway project → **+ New** → **Database** → **PostgreSQL**
2. In your **kawayan** web service → **Variables**, reference the Postgres service:

```
ConnectionStrings__DefaultConnection=Host=${{Postgres.PGHOST}};Port=${{Postgres.PGPORT}};Database=${{Postgres.PGDATABASE}};Username=${{Postgres.PGUSER}};Password=${{Postgres.PGPASSWORD}}
```

Or link the PostgreSQL plugin so Railway injects `DATABASE_URL` (supported automatically).

### 2. First-deploy variables

```
ASPNETCORE_ENVIRONMENT=Production
Jwt__Key=<random-string-at-least-32-chars>
Jwt__Issuer=kawayan
Jwt__Audience=kawayan
Database__ApplyMigrationsOnStartup=true
Database__SeedOnStartup=true
```

Deploy once, confirm login works, then set both `Database__*` flags back to `false`.

### 3. Persist uploads

Attach a Railway **Volume** mounted at `/app/wwwroot/uploads`.

### 4. Deploy

Push to GitHub — Railway builds via `Dockerfile` and serves the SPA from `wwwroot`.

### Local Docker test

```powershell
docker build -t kawayan .
docker run --rm -p 8080:8080 -e PORT=8080 `
  -e ConnectionStrings__DefaultConnection="Host=host.docker.internal;Port=5432;Database=kawayan_dev;Username=postgres;Password=postgres" `
  -e Jwt__Key="local-dev-key-at-least-32-chars!!" `
  -e Jwt__Issuer=kawayan -e Jwt__Audience=kawayan `
  -e Database__ApplyMigrationsOnStartup=true `
  -e Database__SeedOnStartup=true `
  kawayan
```

## Database

### EF Core migrations (PostgreSQL)

Migrations live in `src/kawayan.API/Migrations/` (`InitialPostgres` is the baseline).

```powershell
cd src/kawayan.API
dotnet ef migrations add <Name>
dotnet ef database update
```

Regenerate the idempotent schema block (then merge seed sections from `deploy.sql`):

```powershell
dotnet ef migrations script --idempotent -p src/kawayan.API -o database/_schema.postgresql.sql
```

> `database/deploy.sqlserver.sql` is the archived **SQL Server** script. Use `deploy.sql` for PostgreSQL.

### Seed data

`database/deploy.sql` includes idempotent seed data (company, services, admin, articles, page sections, legal pages).

When `Database:SeedOnStartup` is enabled, `KawayanSeedData.cs`, `LegalPagesSeedData.cs`, and `DbSeeder.cs` also populate sample content idempotently.

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
