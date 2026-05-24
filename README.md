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
├── Dockerfile              # Railway / container build
├── railway.toml            # Railway deploy settings
├── .env.example            # Environment variable template
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

On hosted platforms (Railway, MonsterASP, etc.), set these as environment variables using `__` as the section separator (`ConnectionStrings__DefaultConnection`, `Jwt__Key`, etc.). See `.env.example`.

## Deploy to Railway (Hobby + external SQL Server)

Railway hosts the app; SQL Server stays on an external provider (e.g. MonsterASP).

### 1. Prepare the database

Run `database/deploy.sql` against your external SQL Server once (SSMS, Azure Data Studio, or `sqlcmd`). Enable remote SQL access on the database host so Railway can connect.

### 2. Create the Railway service

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub** → select this repo.
2. Railway detects `Dockerfile` and `railway.toml` automatically.
3. No Railway database plugin is needed — use your existing SQL Server connection string.

### 3. Set variables

In the Railway service → **Variables**, add the values from `.env.example`:

| Variable | Notes |
|----------|--------|
| `ConnectionStrings__DefaultConnection` | MonsterASP (or other) SQL connection string |
| `Jwt__Key` | Random string, ≥ 32 characters |
| `Jwt__Issuer` / `Jwt__Audience` | `kawayan` |
| `Database__ApplyMigrationsOnStartup` | `false` (use `deploy.sql`) |
| `Database__SeedOnStartup` | `false` if seed data is already in SQL |

`ASPNETCORE_ENVIRONMENT=Production` is set in the Dockerfile.

### 4. Persist uploads

Attach a Railway **Volume** mounted at:

```text
/app/wwwroot/uploads
```

Without this, admin-uploaded images are lost on redeploy.

### 5. Deploy

Push to GitHub (or click **Deploy**). Railway builds the Docker image (React + .NET), binds to the `PORT` it assigns, and serves the SPA from `wwwroot`.

Optional: **Settings → Networking → Custom Domain** for your production URL.

### Local Docker test

```powershell
docker build -t kawayan .
docker run --rm -p 8080:8080 -e PORT=8080 `
  -e ConnectionStrings__DefaultConnection="Server=...;..." `
  -e Jwt__Key="local-dev-key-at-least-32-chars!!" `
  -e Jwt__Issuer=kawayan -e Jwt__Audience=kawayan `
  kawayan
```

Open [http://localhost:8080](http://localhost:8080).

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
