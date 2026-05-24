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
│   └── deploy.pgsql        # PostgreSQL deploy + seed (idempotent)
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

**Local dev** (connects to Railway Postgres via public proxy) — already set in `appsettings.Development.json`:

```json
"DefaultConnection": "Host=kodama.proxy.rlwy.net;Port=20037;Database=railway;Username=postgres;Password=...;SSL Mode=Require;Trust Server Certificate=true"
```

**Railway production** — on the kawayan service, set:

```
DATABASE_URL=postgresql://postgres:PASSWORD@postgres.railway.internal:5432/railway
```

Or link the Postgres plugin (Railway injects `DATABASE_URL` automatically).

Run migrations or the deploy script:

```powershell
cd src/kawayan.API
dotnet ef database update
```

```powershell
psql "$DATABASE_PUBLIC_URL" -f database/deploy.pgsql
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

### Default admin account (deploy.pgsql seed)

| Email | Password |
|-------|----------|
| `admin@kawayan.com` | `Admin123!` |

EF startup seed (`DbSeeder`) uses `admin@kawayan.test` / `Admin123!` if `Database__SeedOnStartup=true` instead.

## Configuration

| Setting | Description |
|---------|-------------|
| `ConnectionStrings:DefaultConnection` | PostgreSQL connection string (Npgsql format) |
| `DATABASE_URL` | Railway internal Postgres URL (production) |
| `DATABASE_PUBLIC_URL` | Railway public proxy URL (local dev from your PC) |
| `Jwt:Key` | Signing key (minimum 32 characters) |
| `Jwt:Issuer` / `Jwt:Audience` | JWT validation |
| `Database:ApplyMigrationsOnStartup` | Run EF migrations on startup (default `true` in Development) |
| `Database:SeedOnStartup` | Run C# seed data on startup (default `true` in Development) |

On Railway, set variables on the **kawayan** service using `__` as the section separator. Keep secrets in `.env` (gitignored).

## Deploy to Railway (PostgreSQL)

Railway hosts the app **and** PostgreSQL on the same private network — no external SQL firewall issues.

### 1. Link PostgreSQL on Railway

On the **kawayan** service (not Postgres):

1. **Variables** → **+ New Variable** → **Add Reference**
2. Select your **Postgres** service
3. Pick **`DATABASE_URL`**
4. Save and **Redeploy**

The variable name on kawayan must be exactly `DATABASE_URL`. If your Postgres service is not named `Postgres`, the reference becomes `${{YourServiceName.DATABASE_URL}}`.

Also set on kawayan:

```
Jwt__Key=<your-key-at-least-32-chars>
Jwt__Issuer=kawayan
Jwt__Audience=kawayan
Database__ApplyMigrationsOnStartup=true
```

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

Regenerate the idempotent schema block (then merge seed sections from `deploy.pgsql`):

```powershell
dotnet ef migrations script --idempotent -p src/kawayan.API -o database/_schema.postgresql.sql
```

### Seed data

`database/deploy.pgsql` includes idempotent seed data (company, services, admin, articles, page sections, legal pages).

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
