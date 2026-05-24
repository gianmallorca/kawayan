/*
================================================================================
 kawayan - Unified Database Deploy Script
 (Brand: kaw.a.yan — Baybayin ᜃᜏ᜔.ᜀᜌ᜔.ᜀᜈ᜔; backend/SQL identifiers: kawayan)
================================================================================
 Purpose   : Apply all EF Core migrations to SQL Server (idempotent / safe to re-run)
 Database  : SQL Server (matches AppDbContext + Migrations folder)
 Migrations: 20260516114440_InitialCreate
             20260516115009_HelloWorld
             20260516125256_StructuredCompanyAddress
             20260516131418_AddBarangayToCompanyDetails
             20260518032807_AddDualCompanyName
             20260523120000_AddArticles
             20260518140000_AddLegalPages
             20260524120000_AddArticleAuthorAndImageDescription

 Usage     : Run against your target database before or instead of dotnet ef database update
             sqlcmd -S <server> -d <database> -i deploy.sql
             Or execute in SSMS / Azure Data Studio

 Regenerate: dotnet ef migrations script --idempotent -p src/kawayan.API
================================================================================
*/

SET NOCOUNT ON;
GO

/* =============================================================================
   STEP 1 - EF Core migration history table
   ============================================================================= */
IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;

/* =============================================================================
   STEP 2 - Migration: 20260516114440_InitialCreate
   Creates all core tables, foreign keys, and indexes
   ============================================================================= */
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260516114440_InitialCreate'
)
BEGIN
    CREATE TABLE [CompanyDetails] (
        [Id] int NOT NULL,
        [CompanyName] nvarchar(max) NOT NULL,
        [Tagline] nvarchar(max) NOT NULL,
        [LogoUrl] nvarchar(max) NULL,
        [PrimaryColor] nvarchar(max) NOT NULL,
        [Email] nvarchar(max) NOT NULL,
        [Phone] nvarchar(max) NOT NULL,
        [Address] nvarchar(max) NOT NULL,
        [Website] nvarchar(max) NOT NULL,
        [SocialLinksJson] nvarchar(max) NOT NULL,
        [CoverImageUrl] nvarchar(max) NULL,
        [AboutImageUrl] nvarchar(max) NULL,
        [EstablishedYear] int NULL,
        [ShortDescription] nvarchar(max) NOT NULL,
        [FullDescription] nvarchar(max) NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_CompanyDetails] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260516114440_InitialCreate'
)
BEGIN
    CREATE TABLE [MediaFiles] (
        [Id] int NOT NULL IDENTITY,
        [FileName] nvarchar(max) NOT NULL,
        [Url] nvarchar(max) NOT NULL,
        [UploadedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_MediaFiles] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260516114440_InitialCreate'
)
BEGIN
    CREATE TABLE [PageSections] (
        [Id] int NOT NULL IDENTITY,
        [Page] nvarchar(450) NOT NULL,
        [SectionKey] nvarchar(450) NOT NULL,
        [ContentJson] nvarchar(max) NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_PageSections] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260516114440_InitialCreate'
)
BEGIN
    CREATE TABLE [Roles] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(max) NOT NULL,
        CONSTRAINT [PK_Roles] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260516114440_InitialCreate'
)
BEGIN
    CREATE TABLE [Services] (
        [Id] int NOT NULL IDENTITY,
        [Title] nvarchar(max) NOT NULL,
        [Description] nvarchar(max) NOT NULL,
        [IconUrl] nvarchar(max) NULL,
        [ImageUrl] nvarchar(max) NULL,
        CONSTRAINT [PK_Services] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260516114440_InitialCreate'
)
BEGIN
    CREATE TABLE [Users] (
        [Id] int NOT NULL IDENTITY,
        [Email] nvarchar(450) NOT NULL,
        [PasswordHash] nvarchar(max) NOT NULL,
        [DisplayName] nvarchar(max) NOT NULL,
        [IsActive] bit NOT NULL,
        CONSTRAINT [PK_Users] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260516114440_InitialCreate'
)
BEGIN
    CREATE TABLE [RolePermissions] (
        [RoleId] int NOT NULL,
        [Permission] nvarchar(450) NOT NULL,
        CONSTRAINT [PK_RolePermissions] PRIMARY KEY ([RoleId], [Permission]),
        CONSTRAINT [FK_RolePermissions_Roles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [Roles] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260516114440_InitialCreate'
)
BEGIN
    CREATE TABLE [RefreshTokens] (
        [Id] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [Token] nvarchar(450) NOT NULL,
        [ExpiresAt] datetime2 NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_RefreshTokens] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_RefreshTokens_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260516114440_InitialCreate'
)
BEGIN
    CREATE TABLE [UserRoles] (
        [UserId] int NOT NULL,
        [RoleId] int NOT NULL,
        CONSTRAINT [PK_UserRoles] PRIMARY KEY ([UserId], [RoleId]),
        CONSTRAINT [FK_UserRoles_Roles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [Roles] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_UserRoles_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260516114440_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_PageSections_Page_SectionKey] ON [PageSections] ([Page], [SectionKey]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260516114440_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_RefreshTokens_Token] ON [RefreshTokens] ([Token]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260516114440_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_RefreshTokens_UserId] ON [RefreshTokens] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260516114440_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_UserRoles_RoleId] ON [UserRoles] ([RoleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260516114440_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Users_Email] ON [Users] ([Email]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260516114440_InitialCreate'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260516114440_InitialCreate', N'9.0.4');
END;

/* =============================================================================
   STEP 3 - Migration: 20260516115009_HelloWorld
   (empty migration - records history only)
   ============================================================================= */
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260516115009_HelloWorld'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260516115009_HelloWorld', N'9.0.4');
END;

/* =============================================================================
   STEP 4 - Migration: 20260516125256_StructuredCompanyAddress
   Replaces Address with structured location fields + coordinates
   ============================================================================= */
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260516125256_StructuredCompanyAddress'
)
BEGIN
    IF COL_LENGTH(N'dbo.CompanyDetails', N'Street') IS NULL
        ALTER TABLE [CompanyDetails] ADD [Street] nvarchar(max) NOT NULL DEFAULT N'';
    IF COL_LENGTH(N'dbo.CompanyDetails', N'City') IS NULL
        ALTER TABLE [CompanyDetails] ADD [City] nvarchar(max) NOT NULL DEFAULT N'';
    IF COL_LENGTH(N'dbo.CompanyDetails', N'Province') IS NULL
        ALTER TABLE [CompanyDetails] ADD [Province] nvarchar(max) NOT NULL DEFAULT N'';
    IF COL_LENGTH(N'dbo.CompanyDetails', N'Region') IS NULL
        ALTER TABLE [CompanyDetails] ADD [Region] nvarchar(max) NOT NULL DEFAULT N'';
    IF COL_LENGTH(N'dbo.CompanyDetails', N'Country') IS NULL
        ALTER TABLE [CompanyDetails] ADD [Country] nvarchar(max) NOT NULL DEFAULT N'';
    IF COL_LENGTH(N'dbo.CompanyDetails', N'PostalCode') IS NULL
        ALTER TABLE [CompanyDetails] ADD [PostalCode] nvarchar(max) NOT NULL DEFAULT N'';
    IF COL_LENGTH(N'dbo.CompanyDetails', N'Latitude') IS NULL
        ALTER TABLE [CompanyDetails] ADD [Latitude] decimal(9,6) NULL;
    IF COL_LENGTH(N'dbo.CompanyDetails', N'Longitude') IS NULL
        ALTER TABLE [CompanyDetails] ADD [Longitude] decimal(9,6) NULL;

    /* Dynamic SQL: Address may already be dropped (e.g. via dotnet ef); static SQL fails at compile time */
    IF COL_LENGTH(N'dbo.CompanyDetails', N'Address') IS NOT NULL
    BEGIN
        EXEC(N'
            UPDATE [CompanyDetails]
            SET [Street] = [Address]
            WHERE ([Street] = N'''' OR [Street] IS NULL) AND [Address] IS NOT NULL AND [Address] <> N'''';
        ');

        DECLARE @addressDefault sysname;
        SELECT @addressDefault = [d].[name]
        FROM [sys].[default_constraints] [d]
        INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
        WHERE ([d].[parent_object_id] = OBJECT_ID(N'[CompanyDetails]') AND [c].[name] = N'Address');
        IF @addressDefault IS NOT NULL
            EXEC(N'ALTER TABLE [CompanyDetails] DROP CONSTRAINT [' + @addressDefault + N'];');
        EXEC(N'ALTER TABLE [CompanyDetails] DROP COLUMN [Address];');
    END;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260516125256_StructuredCompanyAddress'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260516125256_StructuredCompanyAddress', N'9.0.4');
END;

/* =============================================================================
   STEP 5 - Migration: 20260516131418_AddBarangayToCompanyDetails
   ============================================================================= */
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260516131418_AddBarangayToCompanyDetails'
)
BEGIN
    IF COL_LENGTH(N'dbo.CompanyDetails', N'Barangay') IS NULL
        ALTER TABLE [CompanyDetails] ADD [Barangay] nvarchar(max) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260516131418_AddBarangayToCompanyDetails'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260516131418_AddBarangayToCompanyDetails', N'9.0.4');
END;

/* =============================================================================
   STEP 6 - Migration: 20260518032807_AddDualCompanyName
   Dual company name: display Latin (NameMain = kaw.a.yan) + Baybayin (NameBaybayin)
   ============================================================================= */
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260518032807_AddDualCompanyName'
)
BEGIN
    IF COL_LENGTH(N'dbo.CompanyDetails', N'CompanyName') IS NOT NULL
        EXEC sp_rename N'[CompanyDetails].[CompanyName]', N'NameMain', N'COLUMN';
    ELSE IF COL_LENGTH(N'dbo.CompanyDetails', N'NameMain') IS NULL
        ALTER TABLE [CompanyDetails] ADD [NameMain] nvarchar(max) NOT NULL DEFAULT N'';

    IF COL_LENGTH(N'dbo.CompanyDetails', N'NameBaybayin') IS NULL
        ALTER TABLE [CompanyDetails] ADD [NameBaybayin] nvarchar(max) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260518032807_AddDualCompanyName'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260518032807_AddDualCompanyName', N'9.0.4');
END;

COMMIT;
GO

/* =============================================================================
   STEP 7 - Reference seed data (optional, idempotent)
   Mirrors KawayanSeedData.cs + DbSeeder.cs + LegalPagesSeedData.cs
   STEP 14 adds articles, legal pages, and page sections for SQL-only deploys
   ============================================================================= */

-- 6a. Default company profile (Id = 1)
IF NOT EXISTS (SELECT 1 FROM [CompanyDetails] WHERE [Id] = 1)
BEGIN
    INSERT INTO [CompanyDetails] (
        [Id], [NameMain], [NameBaybayin], [Tagline], [LogoUrl], [PrimaryColor], [Email], [Phone],
        [Street], [Barangay], [City], [Province], [Region], [Country], [PostalCode],
        [Latitude], [Longitude], [Website], [SocialLinksJson],
        [CoverImageUrl], [AboutImageUrl], [EstablishedYear],
        [ShortDescription], [FullDescription], [UpdatedAt]
    )
    VALUES (
        1,
        N'kaw.a.yan',
        N'ᜃᜏ᜔.ᜀᜌ᜔.ᜀᜈ᜔',
        N'Sustainable. Strong. Natural.',
        NULL,
        N'#4A7C59',
        N'hello@kawayan.com',
        N'+63 912 345 6789',
        N'123 Bamboo Road',
        N'',
        N'Cagayan de Oro',
        N'Misamis Oriental',
        N'Northern Mindanao',
        N'Philippines',
        N'9000',
        8.484722,
        124.647222,
        N'https://kawayan.com',
        N'{"facebook":"https://facebook.com/kawayan","instagram":"https://instagram.com/kawayan"}',
        N'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1600&h=900&fit=crop',
        N'https://images.unsplash.com/photo-1598900384379-02b0883e4952?w=800&h=600&fit=crop',
        2010,
        N'kaw.a.yan — premium bamboo products and raw materials for construction, furniture, crafts, and agriculture — delivered across the region.',
        N'kaw.a.yan (kawayan) has been supplying high-quality bamboo to businesses and individuals since 2010. We work directly with local bamboo farmers to ensure sustainable harvesting practices, consistent quality, and fair pricing. Our product range covers raw bamboo poles, treated lumber, woven panels, and custom cuts for any project size.',
        SYSUTCDATETIME()
    );
END;
GO

-- 6b. Default services catalog
IF NOT EXISTS (SELECT 1 FROM [Services])
BEGIN
    INSERT INTO [Services] ([Title], [Description], [IconUrl], [ImageUrl]) VALUES
    (N'Raw Bamboo Poles', N'Available in various lengths (3m, 6m, 9m) and diameters. Suitable for construction, scaffolding, garden structures, and fencing. Sold per pole or in bulk.', NULL, N'https://images.unsplash.com/photo-1598900384379-02b0883e4952?w=600&h=400&fit=crop'),
    (N'Treated Bamboo Lumber', N'Kiln-dried and pressure-treated for extended lifespan. Resistant to insects, moisture, and warping. Ideal for flooring, decking, and structural framing.', NULL, N'https://images.unsplash.com/photo-1501004318641-b39e0a090e8e?w=600&h=400&fit=crop'),
    (N'Woven Bamboo Panels', N'Hand-woven panels in various weave patterns. Used for interior walls, ceilings, furniture backing, and decorative partitions. Natural and stained finishes available.', NULL, N'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&h=400&fit=crop'),
    (N'Bamboo Stakes & Garden Poles', N'Thin, lightweight poles for plant support, trellises, and agricultural use. Available in bundles of 50 or 100.', NULL, N'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop'),
    (N'Bulk & Wholesale Supply', N'Volume pricing for contractors, furniture manufacturers, and exporters. Minimum order quantities apply. Contact us for a custom quote.', NULL, N'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&h=400&fit=crop'),
    (N'Custom Cut Orders', N'Need a non-standard size or a specific treatment? We accept custom orders with a 5-7 business day lead time.', NULL, N'https://images.unsplash.com/photo-1503387763038-714adcc6aa3d?w=600&h=400&fit=crop');
END;
GO

-- 6c. Default administrator (password: Admin123!)
IF NOT EXISTS (SELECT 1 FROM [Users])
BEGIN
    DECLARE @AdminRoleId int;
    DECLARE @AdminUserId int;

    INSERT INTO [Roles] ([Name]) VALUES (N'Administrator');
    SET @AdminRoleId = SCOPE_IDENTITY();

    INSERT INTO [RolePermissions] ([RoleId], [Permission]) VALUES
        (@AdminRoleId, N'content.manage'),
        (@AdminRoleId, N'media.manage');

    INSERT INTO [Users] ([Email], [PasswordHash], [DisplayName], [IsActive])
    VALUES (
        N'admin@kawayan.com',
        N'$2a$11$cwABrJoUwTw/ZfsjXdhUJeaMJknwJQ20/0qe.sGCbi4sN6FW872he',
        N'Administrator',
        1
    );
    SET @AdminUserId = SCOPE_IDENTITY();

    INSERT INTO [UserRoles] ([UserId], [RoleId])
    VALUES (@AdminUserId, @AdminRoleId);
END;
GO

-- 7. Remove deprecated SiteSettings module
IF OBJECT_ID(N'[SiteSettings]', N'U') IS NOT NULL
BEGIN
    DROP TABLE [SiteSettings];
END;
DELETE FROM [RolePermissions] WHERE [Permission] = N'settings.manage';

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520120000_RemoveSiteSettings'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260520120000_RemoveSiteSettings', N'9.0.0');
END;
GO

-- 8. Remove Services.SortOrder (order by Id instead)
IF COL_LENGTH(N'dbo.Services', N'SortOrder') IS NOT NULL
    ALTER TABLE [Services] DROP COLUMN [SortOrder];

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521120000_RemoveServiceSortOrder'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260521120000_RemoveServiceSortOrder', N'9.0.0');
END;
GO

-- 9. Inquiries (contact form submissions)
IF OBJECT_ID(N'[Inquiries]', N'U') IS NULL
BEGIN
    CREATE TABLE [Inquiries] (
        [Id] int NOT NULL IDENTITY,
        [SenderName] nvarchar(max) NOT NULL,
        [SenderEmail] nvarchar(max) NOT NULL,
        [Phone] nvarchar(max) NOT NULL,
        [Subject] nvarchar(max) NOT NULL,
        [Message] nvarchar(max) NOT NULL,
        [IsRead] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Inquiries] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260522120000_AddInquiries'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260522120000_AddInquiries', N'9.0.0');
END;
GO

-- 10. Articles
IF OBJECT_ID(N'[Articles]', N'U') IS NULL
BEGIN
    CREATE TABLE [Articles] (
        [Id] int NOT NULL IDENTITY,
        [Title] nvarchar(max) NOT NULL,
        [Slug] nvarchar(450) NOT NULL,
        [Description] nvarchar(max) NOT NULL,
        [Content] nvarchar(max) NOT NULL,
        [ImageUrl] nvarchar(max) NULL,
        [IsPublished] bit NOT NULL,
        [PublishedAt] datetime2 NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Articles] PRIMARY KEY ([Id])
    );
    CREATE UNIQUE INDEX [IX_Articles_Slug] ON [Articles] ([Slug]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260523120000_AddArticles'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260523120000_AddArticles', N'9.0.0');
END;
GO

-- 11. Legal pages
IF OBJECT_ID(N'[LegalPages]', N'U') IS NULL
BEGIN
    CREATE TABLE [LegalPages] (
        [Id] int NOT NULL IDENTITY,
        [Slug] nvarchar(450) NOT NULL,
        [Title] nvarchar(max) NOT NULL,
        [Body] nvarchar(max) NOT NULL,
        [LastRevised] date NULL,
        [IsPublished] bit NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_LegalPages] PRIMARY KEY ([Id])
    );
    CREATE UNIQUE INDEX [IX_LegalPages_Slug] ON [LegalPages] ([Slug]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260518140000_AddLegalPages'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260518140000_AddLegalPages', N'9.0.0');
END;
GO

/* =============================================================================
   STEP 12 - Migration: 20260524120000_AddArticleAuthorAndImageDescription
   ============================================================================= */
IF COL_LENGTH(N'Articles', N'AuthorFullName') IS NULL
BEGIN
    ALTER TABLE [Articles] ADD [AuthorFullName] nvarchar(max) NOT NULL CONSTRAINT [DF_Articles_AuthorFullName] DEFAULT (N'');
END;
GO

IF COL_LENGTH(N'Articles', N'ImageDescription') IS NULL
BEGIN
    ALTER TABLE [Articles] ADD [ImageDescription] nvarchar(max) NOT NULL CONSTRAINT [DF_Articles_ImageDescription] DEFAULT (N'');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260524120000_AddArticleAuthorAndImageDescription'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260524120000_AddArticleAuthorAndImageDescription', N'9.0.0');
END;
GO

/* =============================================================================
   STEP 13 - Migration: 20260525120000_AddServicePrice
   Adds optional Price field to Services table
   ============================================================================= */
IF COL_LENGTH(N'dbo.Services', N'Price') IS NULL
BEGIN
    ALTER TABLE [Services] ADD [Price] decimal(18,2) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260525120000_AddServicePrice'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260525120000_AddServicePrice', N'9.0.0');
END;
GO

/* =============================================================================
   STEP 14 - Public content seed (articles, legal pages, page sections)
   Idempotent: skips rows that already exist (by slug or page+sectionKey)
   ============================================================================= */

-- Legal pages ({{company_name}} replaced by API when served)
IF NOT EXISTS (SELECT 1 FROM [LegalPages] WHERE [Slug] = N'privacy-policy')
    INSERT INTO [LegalPages] ([Slug], [Title], [Body], [LastRevised], [IsPublished], [UpdatedAt])
    VALUES (
        N'privacy-policy',
        N'Privacy Policy',
        N'This Privacy Policy describes how {{company_name}} ("we", "us") collects, uses, and protects personal information when you visit our website or contact us.' + NCHAR(10) + NCHAR(10)
        + N'Information we collect: name, email, phone, and messages sent through our contact form; basic technical data in server logs.' + NCHAR(10) + NCHAR(10)
        + N'How we use information: to respond to inquiries, deliver services, improve our website, and meet legal obligations. We do not sell your personal information.' + NCHAR(10) + NCHAR(10)
        + N'Cookies: we use essential cookies for site operation. If analytics are enabled later, this policy will be updated.' + NCHAR(10) + NCHAR(10)
        + N'Your rights: contact us through the email on our Contact page to request access, correction, or deletion of your data.',
        CAST(SYSUTCDATETIME() AS date), 1, SYSUTCDATETIME());

IF NOT EXISTS (SELECT 1 FROM [LegalPages] WHERE [Slug] = N'terms')
    INSERT INTO [LegalPages] ([Slug], [Title], [Body], [LastRevised], [IsPublished], [UpdatedAt])
    VALUES (
        N'terms',
        N'Terms of Service',
        N'These Terms of Service govern your use of the {{company_name}} website. By accessing this site, you agree to these terms.' + NCHAR(10) + NCHAR(10)
        + N'Use of the website: browse for lawful purposes only. Do not disrupt the site, scrape content without permission, or harm other users.' + NCHAR(10) + NCHAR(10)
        + N'Information on this site is general. Product descriptions, pricing, and availability may change. Nothing here is a binding offer until confirmed in writing by {{company_name}}.' + NCHAR(10) + NCHAR(10)
        + N'Intellectual property: materials on this site are owned by {{company_name}} or used with permission. Do not copy or redistribute without prior written consent.' + NCHAR(10) + NCHAR(10)
        + N'Limitation of liability: to the fullest extent permitted by law, {{company_name}} is not liable for indirect or consequential damages from your use of this website.' + NCHAR(10) + NCHAR(10)
        + N'Governing law: the laws of the Philippines unless otherwise required. We may update these terms; continued use after changes means acceptance.',
        CAST(SYSUTCDATETIME() AS date), 1, SYSUTCDATETIME());

IF NOT EXISTS (SELECT 1 FROM [LegalPages] WHERE [Slug] = N'cookie-policy')
    INSERT INTO [LegalPages] ([Slug], [Title], [Body], [LastRevised], [IsPublished], [UpdatedAt])
    VALUES (
        N'cookie-policy',
        N'Cookie Policy',
        N'This Cookie Policy explains how {{company_name}} uses cookies and similar technologies on our website.' + NCHAR(10) + NCHAR(10)
        + N'Cookies are small text files stored on your device. They help remember preferences and understand how visitors use pages.' + NCHAR(10) + NCHAR(10)
        + N'Essential cookies are required for basic operation (for example admin sign-in and security). Analytics cookies are only used if our team enables them.' + NCHAR(10) + NCHAR(10)
        + N'You can control cookies in your browser. Disabling essential cookies may affect how parts of the site work.' + NCHAR(10) + NCHAR(10)
        + N'We may update this policy when our tools change. Questions: use the contact details on our Contact page.',
        CAST(SYSUTCDATETIME() AS date), 1, SYSUTCDATETIME());
GO

-- Page sections (camelCase JSON matches KawayanSeedData / public UI)
IF NOT EXISTS (SELECT 1 FROM [PageSections] WHERE [Page] = N'home' AND [SectionKey] = N'hero')
    INSERT INTO [PageSections] ([Page], [SectionKey], [ContentJson], [UpdatedAt]) VALUES (N'home', N'hero', N'{"subtext":"Premium bamboo poles, lumber, and woven materials sourced with care across Mindanao.","ctaPrimary":"View Services","ctaPrimaryLink":"/services","ctaSecondary":"Contact Us","ctaSecondaryLink":"/contact"}', SYSUTCDATETIME());

IF NOT EXISTS (SELECT 1 FROM [PageSections] WHERE [Page] = N'home' AND [SectionKey] = N'whyChooseUs')
    INSERT INTO [PageSections] ([Page], [SectionKey], [ContentJson], [UpdatedAt]) VALUES (N'home', N'whyChooseUs', N'{"cards":[{"icon":"🌿","title":"Farm-direct quality","body":"We coordinate with local growers so poles meet consistent diameter and moisture checks before dispatch."},{"icon":"🪵","title":"Treatment options","body":"Ask for treatment suited to humidity, insects, and load so your build lasts in tropical conditions."},{"icon":"📦","title":"Retail to wholesale","body":"From bundled garden stakes to truckload jobs for contractors, we align cuts and logistics to your timeline."}]}', SYSUTCDATETIME());

IF NOT EXISTS (SELECT 1 FROM [PageSections] WHERE [Page] = N'home' AND [SectionKey] = N'missionVision')
    INSERT INTO [PageSections] ([Page], [SectionKey], [ContentJson], [UpdatedAt]) VALUES (N'home', N'missionVision', N'{"mission":"Supply responsible, high-quality bamboo materials that help builders, furniture makers, and growers succeed.","vision":"Be a trusted Mindanao partner for sustainable bamboo—growing with our partners and the landscapes we depend on."}', SYSUTCDATETIME());

IF NOT EXISTS (SELECT 1 FROM [PageSections] WHERE [Page] = N'home' AND [SectionKey] = N'stats')
    INSERT INTO [PageSections] ([Page], [SectionKey], [ContentJson], [UpdatedAt]) VALUES (N'home', N'stats', N'{"items":[{"value":"14+","label":"Years in business"},{"value":"500K+","label":"Poles supplied"},{"value":"180+","label":"Partner outlets"},{"value":"24/7","label":"Inquiry line"}]}', SYSUTCDATETIME());

IF NOT EXISTS (SELECT 1 FROM [PageSections] WHERE [Page] = N'home' AND [SectionKey] = N'testimonials')
    INSERT INTO [PageSections] ([Page], [SectionKey], [ContentJson], [UpdatedAt]) VALUES (N'home', N'testimonials', N'{"items":[{"quote":"Treated poles for our resort cabanas arrived on schedule and passed our engineer inspection.","name":"Dennis V.","role":"Project Manager, Bukidnon"},{"quote":"We order woven panels monthly for export crates; kaw.a.yan keeps weave density consistent batch to batch.","name":"Rina L.","role":"Operations, Cagayan de Oro"},{"quote":"Wholesale pricing and straight answers on lead times—finally a supplier that matches how we bid jobs.","name":"Noel K.","role":"Contractor, Misamis Oriental"}]}', SYSUTCDATETIME());

IF NOT EXISTS (SELECT 1 FROM [PageSections] WHERE [Page] = N'home' AND [SectionKey] = N'cta')
    INSERT INTO [PageSections] ([Page], [SectionKey], [ContentJson], [UpdatedAt]) VALUES (N'home', N'cta', N'{"headline":"Planning a build or production run?","subtext":"Share pole lengths, treatment, and delivery window—we will prepare a quote.","buttonText":"Contact us","buttonLink":"/contact"}', SYSUTCDATETIME());

IF NOT EXISTS (SELECT 1 FROM [PageSections] WHERE [Page] = N'about' AND [SectionKey] = N'hero')
    INSERT INTO [PageSections] ([Page], [SectionKey], [ContentJson], [UpdatedAt]) VALUES (N'about', N'hero', N'{"headline":"About kaw.a.yan","subtext":"Bamboo specialists in Cagayan de Oro serving builders, furniture makers, and agricultural partners."}', SYSUTCDATETIME());

IF NOT EXISTS (SELECT 1 FROM [PageSections] WHERE [Page] = N'about' AND [SectionKey] = N'story')
    INSERT INTO [PageSections] ([Page], [SectionKey], [ContentJson], [UpdatedAt]) VALUES (N'about', N'story', N'{"paragraphs":["kaw.a.yan started as a small yard serving local contractors who needed dependable pole sizes and honest moisture readings.","Today we still visit farms with our own checks, expand treatment and cut options, and keep digital records so repeat customers get the same spec every order.","Whether you are prototyping furniture or fencing a plantation, we aim to be the team you call first for bamboo in Northern Mindanao."]}', SYSUTCDATETIME());

IF NOT EXISTS (SELECT 1 FROM [PageSections] WHERE [Page] = N'about' AND [SectionKey] = N'missionVision')
    INSERT INTO [PageSections] ([Page], [SectionKey], [ContentJson], [UpdatedAt]) VALUES (N'about', N'missionVision', N'{"mission":"Supply responsible, high-quality bamboo materials that help builders, furniture makers, and growers succeed.","vision":"Be a trusted Mindanao partner for sustainable bamboo—growing with our partners and the landscapes we depend on."}', SYSUTCDATETIME());

IF NOT EXISTS (SELECT 1 FROM [PageSections] WHERE [Page] = N'about' AND [SectionKey] = N'values')
    INSERT INTO [PageSections] ([Page], [SectionKey], [ContentJson], [UpdatedAt]) VALUES (N'about', N'values', N'{"cards":[{"icon":"🌱","title":"Stewardship","body":"We favor harvest cycles and partners who protect clumps for the next season."},{"icon":"📏","title":"Precision","body":"Measured diameters, straight cuts, and clear labels reduce waste on your site."},{"icon":"🤝","title":"Fair dealing","body":"Quotes spell out grades and treatments—no surprise substitutions."},{"icon":"⚡","title":"Responsiveness","body":"Sales and logistics pick up the phone because timelines drive your cash flow."}]}', SYSUTCDATETIME());

IF NOT EXISTS (SELECT 1 FROM [PageSections] WHERE [Page] = N'about' AND [SectionKey] = N'team')
    INSERT INTO [PageSections] ([Page], [SectionKey], [ContentJson], [UpdatedAt]) VALUES (N'about', N'team', N'{"members":[{"initials":"MR","name":"Mara Ramos","role":"Managing Director","bio":"Sets sourcing standards and works with farm cooperatives on long-term supply."},{"initials":"JP","name":"Jon Paredes","role":"Yard & Treatment Lead","bio":"Runs drying, pressure treatment batches, and final QC before trucks roll out."},{"initials":"AL","name":"Ana Lim","role":"Customer Success","bio":"Coordinates quotes, cut lists, and delivery windows for contractors and exporters."}]}', SYSUTCDATETIME());

IF NOT EXISTS (SELECT 1 FROM [PageSections] WHERE [Page] = N'services' AND [SectionKey] = N'hero')
    INSERT INTO [PageSections] ([Page], [SectionKey], [ContentJson], [UpdatedAt]) VALUES (N'services', N'hero', N'{"headline":"What we supply","subtext":"Raw poles, treated lumber, woven panels, and custom cuts for construction, furniture, crafts, and farms."}', SYSUTCDATETIME());

IF NOT EXISTS (SELECT 1 FROM [PageSections] WHERE [Page] = N'services' AND [SectionKey] = N'cta')
    INSERT INTO [PageSections] ([Page], [SectionKey], [ContentJson], [UpdatedAt]) VALUES (N'services', N'cta', N'{"headline":"Need a volume quote?","subtext":"Send specs and we will match grade, treatment, and logistics to your project.","buttonText":"Contact us","buttonLink":"/contact"}', SYSUTCDATETIME());

IF NOT EXISTS (SELECT 1 FROM [PageSections] WHERE [Page] = N'contact' AND [SectionKey] = N'hero')
    INSERT INTO [PageSections] ([Page], [SectionKey], [ContentJson], [UpdatedAt]) VALUES (N'contact', N'hero', N'{"headline":"Get in touch","subtext":"Quotes, site visits, and pickup windows—tell us what you need."}', SYSUTCDATETIME());

IF NOT EXISTS (SELECT 1 FROM [PageSections] WHERE [Page] = N'contact' AND [SectionKey] = N'details')
    INSERT INTO [PageSections] ([Page], [SectionKey], [ContentJson], [UpdatedAt]) VALUES (N'contact', N'details', N'{"hours":["Monday – Friday: 8:00 AM – 6:00 PM","Saturday: 8:00 AM – 12:00 PM","Sunday: Closed"]}', SYSUTCDATETIME());
GO

-- Sample articles (published; home page shows first three, list shows four)
IF NOT EXISTS (SELECT 1 FROM [Articles] WHERE [Slug] = N'choosing-bamboo-poles-for-builds')
    INSERT INTO [Articles] ([Title], [Slug], [Description], [Content], [ImageUrl], [IsPublished], [PublishedAt], [CreatedAt], [UpdatedAt], [AuthorFullName], [ImageDescription])
    VALUES (
        N'Choosing bamboo poles for tropical builds',
        N'choosing-bamboo-poles-for-builds',
        N'Diameter, age class, and moisture checks that save rework on site.',
        N'Bamboo looks simple until you load it. Start with the structural chart from your engineer, then match pole class to span and connector detail.' + NCHAR(10) + NCHAR(10)
        + N'On receipt, skim for cracks at nodes, spiral shakes, and bore holes. A quick moisture spot-check helps you decide whether to acclimatize before install.' + NCHAR(10) + NCHAR(10)
        + N'When in doubt, step up one diameter class or specify treated stock for ground contact and wet rooms.',
        N'https://images.unsplash.com/photo-1598900384379-02b0883e4952?w=1200&h=750&fit=crop',
        1, SYSUTCDATETIME(), SYSUTCDATETIME(), SYSUTCDATETIME(),
        N'Mara Ramos',
        N'Fresh-cut bamboo poles stacked at a supplier yard.');

IF NOT EXISTS (SELECT 1 FROM [Articles] WHERE [Slug] = N'treatment-options-for-longer-life')
    INSERT INTO [Articles] ([Title], [Slug], [Description], [Content], [ImageUrl], [IsPublished], [PublishedAt], [CreatedAt], [UpdatedAt], [AuthorFullName], [ImageDescription])
    VALUES (
        N'Treatment options for longer-lasting bamboo',
        N'treatment-options-for-longer-life',
        N'How boron, pressure cycles, and drying targets extend service life in humid climates.',
        N'Treatment is not cosmetic—it moves the failure curve. Boron-based systems target starch-loving pests; pressure helps chemistry reach the inner wall.' + NCHAR(10) + NCHAR(10)
        + N'Pair treatment with a drying target suited to your end use: furniture wants stability, outdoor structures want a buffer against rain cycles.' + NCHAR(10) + NCHAR(10)
        + N'Ask your supplier for batch records so you can align warranty and maintenance plans with what actually entered the cylinder.',
        N'https://images.unsplash.com/photo-1501004318641-b39e0a090e8e?w=1200&h=750&fit=crop',
        1, SYSUTCDATETIME(), SYSUTCDATETIME(), SYSUTCDATETIME(),
        N'Jon Paredes',
        N'Planed bamboo strips suitable for interior use after treatment.');

IF NOT EXISTS (SELECT 1 FROM [Articles] WHERE [Slug] = N'woven-panels-for-interiors')
    INSERT INTO [Articles] ([Title], [Slug], [Description], [Content], [ImageUrl], [IsPublished], [PublishedAt], [CreatedAt], [UpdatedAt], [AuthorFullName], [ImageDescription])
    VALUES (
        N'Woven panels: pattern, backing, and install tips',
        N'woven-panels-for-interiors',
        N'What architects ask before specifying woven bamboo for ceilings and partitions.',
        N'Weave pattern drives shadow lines and acoustic behavior. Tighter weaves read more formal; open weaves feel casual but need backing for privacy.' + NCHAR(10) + NCHAR(10)
        + N'Substrate movement is the usual callback issue—use clips or slotted channels where seasons swing humidity hard.' + NCHAR(10) + NCHAR(10)
        + N'Order a sample tile early; color shifts between batches are natural with plant fibers.',
        N'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1200&h=750&fit=crop',
        1, SYSUTCDATETIME(), SYSUTCDATETIME(), SYSUTCDATETIME(),
        N'Ana Lim',
        N'Bamboo canes and woven textures in natural light.');

IF NOT EXISTS (SELECT 1 FROM [Articles] WHERE [Slug] = N'wholesale-checklist-for-buyers')
    INSERT INTO [Articles] ([Title], [Slug], [Description], [Content], [ImageUrl], [IsPublished], [PublishedAt], [CreatedAt], [UpdatedAt], [AuthorFullName], [ImageDescription])
    VALUES (
        N'Wholesale checklist for first-time bamboo buyers',
        N'wholesale-checklist-for-buyers',
        N'Lead times, MOQs, and documents that keep container and loose-truck orders smooth.',
        N'Confirm incoterms, strapping style, and fumigation certificates before you lock vessel space.' + NCHAR(10) + NCHAR(10)
        + N'Share a pack list with net and gross weights; yards photograph loads so both sides agree on bundle counts at gate-out.' + NCHAR(10) + NCHAR(10)
        + N'If you blend SKUs, ask for segregation maps so receivers can put stock away without reshuffling.',
        N'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1200&h=750&fit=crop',
        1, SYSUTCDATETIME(), SYSUTCDATETIME(), SYSUTCDATETIME(),
        N'Mara Ramos',
        N'Warehouse aisle with bundled construction materials.');
GO

PRINT N'kawayan database deploy completed.';
GO
