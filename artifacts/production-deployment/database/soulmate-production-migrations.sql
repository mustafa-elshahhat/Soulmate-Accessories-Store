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
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260305214641_InitialCreate'
)
BEGIN
    CREATE TABLE [BoxTypes] (
        [Id] uniqueidentifier NOT NULL DEFAULT (NEWID()),
        [Name] nvarchar(100) NOT NULL,
        [Slug] nvarchar(200) NOT NULL,
        [Gender] nvarchar(20) NOT NULL,
        [BasePrice] decimal(10,2) NOT NULL,
        [ImageUrl] nvarchar(500) NOT NULL,
        [IsActive] bit NOT NULL DEFAULT CAST(1 AS bit),
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        [UpdatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        CONSTRAINT [PK_BoxTypes] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260305214641_InitialCreate'
)
BEGIN
    CREATE TABLE [Products] (
        [Id] uniqueidentifier NOT NULL DEFAULT (NEWID()),
        [Name] nvarchar(200) NOT NULL,
        [Slug] nvarchar(200) NOT NULL,
        [Description] nvarchar(max) NOT NULL,
        [Price] decimal(10,2) NOT NULL,
        [ImageUrl] nvarchar(500) NOT NULL,
        [GalleryJson] nvarchar(max) NULL,
        [SlotType] nvarchar(50) NOT NULL,
        [Gender] nvarchar(20) NOT NULL,
        [IsActive] bit NOT NULL DEFAULT CAST(1 AS bit),
        [IsStandalone] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        [UpdatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        CONSTRAINT [PK_Products] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260305214641_InitialCreate'
)
BEGIN
    CREATE TABLE [Users] (
        [Id] uniqueidentifier NOT NULL DEFAULT (NEWID()),
        [Name] nvarchar(100) NOT NULL,
        [Email] nvarchar(255) NOT NULL,
        [Phone] nvarchar(20) NOT NULL,
        [PasswordHash] nvarchar(500) NOT NULL,
        [Role] nvarchar(20) NOT NULL DEFAULT N'customer',
        [FailedLoginAttempts] int NOT NULL DEFAULT 0,
        [LockoutEnd] datetime2 NULL,
        [PasswordResetToken] nvarchar(500) NULL,
        [PasswordResetTokenExpiry] datetime2 NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        CONSTRAINT [PK_Users] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260305214641_InitialCreate'
)
BEGIN
    CREATE TABLE [BoxSlots] (
        [Id] uniqueidentifier NOT NULL DEFAULT (NEWID()),
        [BoxTypeId] uniqueidentifier NOT NULL,
        [SlotKey] nvarchar(50) NOT NULL,
        [LabelAr] nvarchar(100) NOT NULL,
        [IsRequired] bit NOT NULL,
        [SortOrder] int NOT NULL,
        [FilterGender] nvarchar(20) NULL,
        CONSTRAINT [PK_BoxSlots] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_BoxSlots_BoxTypes_BoxTypeId] FOREIGN KEY ([BoxTypeId]) REFERENCES [BoxTypes] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260305214641_InitialCreate'
)
BEGIN
    CREATE TABLE [Addresses] (
        [Id] uniqueidentifier NOT NULL DEFAULT (NEWID()),
        [UserId] uniqueidentifier NOT NULL,
        [Label] nvarchar(100) NOT NULL,
        [City] nvarchar(100) NOT NULL,
        [Street] nvarchar(200) NOT NULL,
        [Building] nvarchar(100) NOT NULL,
        [Floor] nvarchar(20) NOT NULL,
        [Lat] float NOT NULL,
        [Lng] float NOT NULL,
        [Phone] nvarchar(20) NOT NULL,
        [Apartment] nvarchar(50) NULL,
        [IsDefault] bit NOT NULL DEFAULT CAST(0 AS bit),
        CONSTRAINT [PK_Addresses] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Addresses_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260305214641_InitialCreate'
)
BEGIN
    CREATE TABLE [RefreshTokens] (
        [Id] uniqueidentifier NOT NULL DEFAULT (NEWID()),
        [UserId] uniqueidentifier NOT NULL,
        [Token] nvarchar(500) NOT NULL,
        [ExpiresAt] datetime2 NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [RevokedAt] datetime2 NULL,
        [IsRevoked] bit NOT NULL DEFAULT CAST(0 AS bit),
        CONSTRAINT [PK_RefreshTokens] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_RefreshTokens_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260305214641_InitialCreate'
)
BEGIN
    CREATE TABLE [Orders] (
        [Id] uniqueidentifier NOT NULL DEFAULT (NEWID()),
        [OrderNumber] nvarchar(20) NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [Status] nvarchar(30) NOT NULL DEFAULT N'pending',
        [TotalPrice] decimal(10,2) NOT NULL,
        [ShippingCost] decimal(10,2) NOT NULL,
        [AddressId] uniqueidentifier NOT NULL,
        [CancelReason] nvarchar(500) NULL,
        [AdminNote] nvarchar(500) NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        [UpdatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        CONSTRAINT [PK_Orders] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Orders_Addresses_AddressId] FOREIGN KEY ([AddressId]) REFERENCES [Addresses] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Orders_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260305214641_InitialCreate'
)
BEGIN
    CREATE TABLE [Notifications] (
        [Id] uniqueidentifier NOT NULL DEFAULT (NEWID()),
        [UserId] uniqueidentifier NOT NULL,
        [Title] nvarchar(200) NOT NULL,
        [Message] nvarchar(max) NOT NULL,
        [IsRead] bit NOT NULL DEFAULT CAST(0 AS bit),
        [OrderId] uniqueidentifier NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        CONSTRAINT [PK_Notifications] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Notifications_Orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [Orders] ([Id]) ON DELETE SET NULL,
        CONSTRAINT [FK_Notifications_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260305214641_InitialCreate'
)
BEGIN
    CREATE TABLE [OrderItems] (
        [Id] uniqueidentifier NOT NULL DEFAULT (NEWID()),
        [OrderId] uniqueidentifier NOT NULL,
        [ProductId] uniqueidentifier NULL,
        [BoxTypeId] uniqueidentifier NULL,
        [Quantity] int NOT NULL,
        [UnitPrice] decimal(10,2) NOT NULL,
        [CustomDataJson] nvarchar(max) NOT NULL,
        CONSTRAINT [PK_OrderItems] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_OrderItems_BoxTypes_BoxTypeId] FOREIGN KEY ([BoxTypeId]) REFERENCES [BoxTypes] ([Id]) ON DELETE SET NULL,
        CONSTRAINT [FK_OrderItems_Orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [Orders] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_OrderItems_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id]) ON DELETE SET NULL
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260305214641_InitialCreate'
)
BEGIN
    CREATE TABLE [Payments] (
        [Id] uniqueidentifier NOT NULL DEFAULT (NEWID()),
        [OrderId] uniqueidentifier NOT NULL,
        [Method] nvarchar(30) NOT NULL,
        [ScreenshotUrl] nvarchar(500) NOT NULL,
        [Status] nvarchar(20) NOT NULL DEFAULT N'pending',
        [AdminNote] nvarchar(500) NULL,
        [AttemptNumber] int NOT NULL DEFAULT 1,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        CONSTRAINT [PK_Payments] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Payments_Orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [Orders] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260305214641_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'BasePrice', N'CreatedAt', N'Gender', N'ImageUrl', N'IsActive', N'Name', N'Slug', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[BoxTypes]'))
        SET IDENTITY_INSERT [BoxTypes] ON;
    EXEC(N'INSERT INTO [BoxTypes] ([Id], [BasePrice], [CreatedAt], [Gender], [ImageUrl], [IsActive], [Name], [Slug], [UpdatedAt])
    VALUES (''a1b2c3d4-e5f6-7890-abcd-ef1234567890'', 200.0, ''2025-01-01T00:00:00.0000000Z'', N''male'', N''/images/box-male.jpg'', CAST(1 AS bit), N''البوكس الرجالي'', N''male-box'', ''2025-01-01T00:00:00.0000000Z''),
    (''b2c3d4e5-f6a7-8901-bcde-f12345678901'', 200.0, ''2025-01-01T00:00:00.0000000Z'', N''female'', N''/images/box-female.jpg'', CAST(1 AS bit), N''البوكس الحريمي'', N''female-box'', ''2025-01-01T00:00:00.0000000Z''),
    (''c3d4e5f6-a7b8-9012-cdef-123456789012'', 350.0, ''2025-01-01T00:00:00.0000000Z'', N''couple'', N''/images/box-couple.jpg'', CAST(1 AS bit), N''بوكس لأجلكما'', N''couple-box'', ''2025-01-01T00:00:00.0000000Z'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'BasePrice', N'CreatedAt', N'Gender', N'ImageUrl', N'IsActive', N'Name', N'Slug', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[BoxTypes]'))
        SET IDENTITY_INSERT [BoxTypes] OFF;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260305214641_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Email', N'LockoutEnd', N'Name', N'PasswordHash', N'PasswordResetToken', N'PasswordResetTokenExpiry', N'Phone', N'Role') AND [object_id] = OBJECT_ID(N'[Users]'))
        SET IDENTITY_INSERT [Users] ON;
    EXEC(N'INSERT INTO [Users] ([Id], [CreatedAt], [Email], [LockoutEnd], [Name], [PasswordHash], [PasswordResetToken], [PasswordResetTokenExpiry], [Phone], [Role])
    VALUES (''d4e5f6a7-b8c9-0123-defa-234567890123'', ''2025-01-01T00:00:00.0000000Z'', N''admin@soulmate-store.com'', NULL, N''Admin'', N''$2a$11$ZYFKOP4eBiJBangTJim4m.o90GXRsWCmGJbCMbXEUbC5RbGOOVBdS'', NULL, NULL, N''01000000000'', N''admin'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Email', N'LockoutEnd', N'Name', N'PasswordHash', N'PasswordResetToken', N'PasswordResetTokenExpiry', N'Phone', N'Role') AND [object_id] = OBJECT_ID(N'[Users]'))
        SET IDENTITY_INSERT [Users] OFF;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260305214641_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'BoxTypeId', N'FilterGender', N'IsRequired', N'LabelAr', N'SlotKey', N'SortOrder') AND [object_id] = OBJECT_ID(N'[BoxSlots]'))
        SET IDENTITY_INSERT [BoxSlots] ON;
    EXEC(N'INSERT INTO [BoxSlots] ([Id], [BoxTypeId], [FilterGender], [IsRequired], [LabelAr], [SlotKey], [SortOrder])
    VALUES (''11111111-0001-0001-0001-000000000001'', ''a1b2c3d4-e5f6-7890-abcd-ef1234567890'', N''male'', CAST(1 AS bit), N''ساعة'', N''watch'', 1),
    (''11111111-0001-0001-0001-000000000002'', ''a1b2c3d4-e5f6-7890-abcd-ef1234567890'', N''male'', CAST(1 AS bit), N''محفظة'', N''wallet'', 2),
    (''11111111-0001-0001-0001-000000000003'', ''a1b2c3d4-e5f6-7890-abcd-ef1234567890'', N''male'', CAST(1 AS bit), N''مج'', N''mug'', 3),
    (''11111111-0001-0001-0001-000000000004'', ''a1b2c3d4-e5f6-7890-abcd-ef1234567890'', N''male'', CAST(1 AS bit), N''سلسلة'', N''chain'', 4),
    (''11111111-0001-0001-0001-000000000005'', ''a1b2c3d4-e5f6-7890-abcd-ef1234567890'', N''male'', CAST(1 AS bit), N''كبك'', N''cufflinks'', 5),
    (''11111111-0001-0001-0001-000000000006'', ''a1b2c3d4-e5f6-7890-abcd-ef1234567890'', N''male'', CAST(1 AS bit), N''خاتم'', N''ring'', 6),
    (''22222222-0002-0002-0002-000000000001'', ''b2c3d4e5-f6a7-8901-bcde-f12345678901'', N''female'', CAST(1 AS bit), N''ساعة'', N''watch'', 1),
    (''22222222-0002-0002-0002-000000000002'', ''b2c3d4e5-f6a7-8901-bcde-f12345678901'', N''female'', CAST(1 AS bit), N''محفظة'', N''wallet'', 2),
    (''22222222-0002-0002-0002-000000000003'', ''b2c3d4e5-f6a7-8901-bcde-f12345678901'', N''female'', CAST(1 AS bit), N''مج'', N''mug'', 3),
    (''22222222-0002-0002-0002-000000000004'', ''b2c3d4e5-f6a7-8901-bcde-f12345678901'', N''female'', CAST(1 AS bit), N''عقد'', N''necklace'', 4),
    (''22222222-0002-0002-0002-000000000005'', ''b2c3d4e5-f6a7-8901-bcde-f12345678901'', N''female'', CAST(1 AS bit), N''إسورة'', N''bracelet'', 5),
    (''22222222-0002-0002-0002-000000000006'', ''b2c3d4e5-f6a7-8901-bcde-f12345678901'', N''female'', CAST(1 AS bit), N''حلق'', N''earrings'', 6),
    (''33333333-0003-0003-0003-000000000001'', ''c3d4e5f6-a7b8-9012-cdef-123456789012'', N''male'', CAST(1 AS bit), N''ساعة له'', N''watch'', 1),
    (''33333333-0003-0003-0003-000000000002'', ''c3d4e5f6-a7b8-9012-cdef-123456789012'', N''female'', CAST(1 AS bit), N''ساعة لها'', N''watch'', 2),
    (''33333333-0003-0003-0003-000000000003'', ''c3d4e5f6-a7b8-9012-cdef-123456789012'', NULL, CAST(1 AS bit), N''محفظة'', N''wallet'', 3),
    (''33333333-0003-0003-0003-000000000004'', ''c3d4e5f6-a7b8-9012-cdef-123456789012'', N''male'', CAST(1 AS bit), N''مج له'', N''mug'', 4),
    (''33333333-0003-0003-0003-000000000005'', ''c3d4e5f6-a7b8-9012-cdef-123456789012'', N''female'', CAST(1 AS bit), N''مج لها'', N''mug'', 5),
    (''33333333-0003-0003-0003-000000000006'', ''c3d4e5f6-a7b8-9012-cdef-123456789012'', N''female'', CAST(1 AS bit), N''عقد'', N''necklace'', 6),
    (''33333333-0003-0003-0003-000000000007'', ''c3d4e5f6-a7b8-9012-cdef-123456789012'', NULL, CAST(1 AS bit), N''خاتم'', N''ring'', 7)');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'BoxTypeId', N'FilterGender', N'IsRequired', N'LabelAr', N'SlotKey', N'SortOrder') AND [object_id] = OBJECT_ID(N'[BoxSlots]'))
        SET IDENTITY_INSERT [BoxSlots] OFF;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260305214641_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Addresses_UserId] ON [Addresses] ([UserId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260305214641_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_BoxSlots_BoxTypeId] ON [BoxSlots] ([BoxTypeId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260305214641_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_BoxSlots_SlotKey] ON [BoxSlots] ([SlotKey]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260305214641_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_BoxTypes_Slug] ON [BoxTypes] ([Slug]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260305214641_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Notifications_OrderId] ON [Notifications] ([OrderId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260305214641_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Notifications_UserId_IsRead] ON [Notifications] ([UserId], [IsRead]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260305214641_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_OrderItems_BoxTypeId] ON [OrderItems] ([BoxTypeId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260305214641_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_OrderItems_OrderId] ON [OrderItems] ([OrderId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260305214641_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_OrderItems_ProductId] ON [OrderItems] ([ProductId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260305214641_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Orders_AddressId] ON [Orders] ([AddressId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260305214641_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Orders_CreatedAt] ON [Orders] ([CreatedAt]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260305214641_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Orders_OrderNumber] ON [Orders] ([OrderNumber]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260305214641_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Orders_Status] ON [Orders] ([Status]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260305214641_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Orders_UserId] ON [Orders] ([UserId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260305214641_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Payments_OrderId] ON [Payments] ([OrderId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260305214641_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Payments_Status] ON [Payments] ([Status]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260305214641_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Products_Gender] ON [Products] ([Gender]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260305214641_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Products_IsActive] ON [Products] ([IsActive]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260305214641_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Products_IsStandalone] ON [Products] ([IsStandalone]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260305214641_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Products_SlotType] ON [Products] ([SlotType]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260305214641_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Products_Slug] ON [Products] ([Slug]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260305214641_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_RefreshTokens_Token] ON [RefreshTokens] ([Token]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260305214641_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_RefreshTokens_UserId] ON [RefreshTokens] ([UserId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260305214641_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Users_Email] ON [Users] ([Email]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260305214641_InitialCreate'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260305214641_InitialCreate', N'8.0.10');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306081439_UpdateBoxTypeImages'
)
BEGIN
    EXEC(N'UPDATE [BoxTypes] SET [ImageUrl] = N''/assets/images/box-male.webp''
    WHERE [Id] = ''a1b2c3d4-e5f6-7890-abcd-ef1234567890'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306081439_UpdateBoxTypeImages'
)
BEGIN
    EXEC(N'UPDATE [BoxTypes] SET [ImageUrl] = N''/assets/images/box-female.webp''
    WHERE [Id] = ''b2c3d4e5-f6a7-8901-bcde-f12345678901'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306081439_UpdateBoxTypeImages'
)
BEGIN
    EXEC(N'UPDATE [BoxTypes] SET [ImageUrl] = N''/assets/images/box-couple.webp''
    WHERE [Id] = ''c3d4e5f6-a7b8-9012-cdef-123456789012'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306081439_UpdateBoxTypeImages'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260306081439_UpdateBoxTypeImages', N'8.0.10');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306083501_ProductCatalogRefactor'
)
BEGIN
    EXEC(N'DELETE FROM [BoxSlots]
    WHERE [Id] = ''11111111-0001-0001-0001-000000000006'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306083501_ProductCatalogRefactor'
)
BEGIN
    EXEC(N'DELETE FROM [BoxSlots]
    WHERE [Id] = ''22222222-0002-0002-0002-000000000006'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306083501_ProductCatalogRefactor'
)
BEGIN
    EXEC sp_rename N'[Products].[SlotType]', N'Category', N'COLUMN';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306083501_ProductCatalogRefactor'
)
BEGIN
    EXEC sp_rename N'[Products].[IX_Products_SlotType]', N'IX_Products_Category', N'INDEX';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306083501_ProductCatalogRefactor'
)
BEGIN
    ALTER TABLE [Products] ADD [IsBuilderItem] bit NOT NULL DEFAULT CAST(0 AS bit);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306083501_ProductCatalogRefactor'
)
BEGIN
    EXEC(N'UPDATE [BoxSlots] SET [SlotKey] = N''necklace''
    WHERE [Id] = ''11111111-0001-0001-0001-000000000004'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306083501_ProductCatalogRefactor'
)
BEGIN
    EXEC(N'UPDATE [BoxSlots] SET [LabelAr] = N''خاتم'', [SlotKey] = N''ring''
    WHERE [Id] = ''11111111-0001-0001-0001-000000000005'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306083501_ProductCatalogRefactor'
)
BEGIN
    EXEC(N'UPDATE [BoxSlots] SET [LabelAr] = N''خاتم'', [SlotKey] = N''ring''
    WHERE [Id] = ''22222222-0002-0002-0002-000000000005'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306083501_ProductCatalogRefactor'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Category', N'CreatedAt', N'Description', N'GalleryJson', N'Gender', N'ImageUrl', N'IsActive', N'IsBuilderItem', N'IsStandalone', N'Name', N'Price', N'Slug', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[Products]'))
        SET IDENTITY_INSERT [Products] ON;
    EXEC(N'INSERT INTO [Products] ([Id], [Category], [CreatedAt], [Description], [GalleryJson], [Gender], [ImageUrl], [IsActive], [IsBuilderItem], [IsStandalone], [Name], [Price], [Slug], [UpdatedAt])
    VALUES (''aaaa0001-0001-0001-0001-000000000001'', N''watch'', ''2025-01-01T00:00:00.0000000Z'', N''ساعة رجالي ذهبية بتصميم كلاسيكي أنيق'', NULL, N''male'', N''/assets/mock-products/watch/men-classic-gold-watch.jpg'', CAST(1 AS bit), CAST(1 AS bit), CAST(1 AS bit), N''ساعة ذهبية كلاسيك رجالي'', 450.0, N''men-classic-gold-watch'', ''2025-01-01T00:00:00.0000000Z''),
    (''aaaa0001-0001-0001-0001-000000000002'', N''watch'', ''2025-01-01T00:00:00.0000000Z'', N''ساعة رجالي بإطار أسود من الستانلس ستيل'', NULL, N''male'', N''/assets/mock-products/watch/men-black-steel-watch.jpg'', CAST(1 AS bit), CAST(1 AS bit), CAST(1 AS bit), N''ساعة سوداء ستيل رجالي'', 400.0, N''men-black-steel-watch'', ''2025-01-01T00:00:00.0000000Z''),
    (''aaaa0001-0001-0001-0001-000000000003'', N''watch'', ''2025-01-01T00:00:00.0000000Z'', N''ساعة رجالي رياضية فضية اللون'', NULL, N''male'', N''/assets/mock-products/watch/men-silver-sport-watch.jpg'', CAST(1 AS bit), CAST(1 AS bit), CAST(1 AS bit), N''ساعة فضية رياضية رجالي'', 380.0, N''men-silver-sport-watch'', ''2025-01-01T00:00:00.0000000Z''),
    (''aaaa0001-0001-0001-0001-000000000004'', N''watch'', ''2025-01-01T00:00:00.0000000Z'', N''ساعة نسائي بلون روز جولد راقي'', NULL, N''female'', N''/assets/mock-products/watch/women-rose-gold-watch.jpg'', CAST(1 AS bit), CAST(1 AS bit), CAST(1 AS bit), N''ساعة روز جولد نسائي'', 420.0, N''women-rose-gold-watch'', ''2025-01-01T00:00:00.0000000Z''),
    (''aaaa0001-0001-0001-0001-000000000005'', N''watch'', ''2025-01-01T00:00:00.0000000Z'', N''ساعة نسائي بتصميم بسيط وأنيق'', NULL, N''female'', N''/assets/mock-products/watch/women-minimal-watch.jpg'', CAST(1 AS bit), CAST(1 AS bit), CAST(1 AS bit), N''ساعة مينيمال نسائي'', 350.0, N''women-minimal-watch'', ''2025-01-01T00:00:00.0000000Z''),
    (''aaaa0001-0001-0001-0001-000000000006'', N''watch'', ''2025-01-01T00:00:00.0000000Z'', N''ساعة نسائي بسوار لؤلؤي فاخر'', NULL, N''female'', N''/assets/mock-products/watch/women-pearl-watch.jpg'', CAST(1 AS bit), CAST(1 AS bit), CAST(1 AS bit), N''ساعة لؤلؤية نسائي'', 480.0, N''women-pearl-watch'', ''2025-01-01T00:00:00.0000000Z''),
    (''aaaa0002-0002-0002-0002-000000000001'', N''wallet'', ''2025-01-01T00:00:00.0000000Z'', N''محفظة رجالي من الجلد الطبيعي البني'', NULL, N''male'', N''/assets/mock-products/wallet/men-brown-leather-wallet.jpg'', CAST(1 AS bit), CAST(1 AS bit), CAST(1 AS bit), N''محفظة جلد بني رجالي'', 280.0, N''men-brown-leather-wallet'', ''2025-01-01T00:00:00.0000000Z''),
    (''aaaa0002-0002-0002-0002-000000000002'', N''wallet'', ''2025-01-01T00:00:00.0000000Z'', N''محفظة رجالي رفيعة بلون أسود أنيق'', NULL, N''male'', N''/assets/mock-products/wallet/men-black-slim-wallet.jpg'', CAST(1 AS bit), CAST(1 AS bit), CAST(1 AS bit), N''محفظة سليم سوداء رجالي'', 250.0, N''men-black-slim-wallet'', ''2025-01-01T00:00:00.0000000Z''),
    (''aaaa0002-0002-0002-0002-000000000003'', N''wallet'', ''2025-01-01T00:00:00.0000000Z'', N''محفظة رجالي كلاسيكية بجيوب متعددة'', NULL, N''male'', N''/assets/mock-products/wallet/men-classic-wallet.jpg'', CAST(1 AS bit), CAST(1 AS bit), CAST(1 AS bit), N''محفظة كلاسيك رجالي'', 300.0, N''men-classic-wallet'', ''2025-01-01T00:00:00.0000000Z''),
    (''aaaa0002-0002-0002-0002-000000000004'', N''wallet'', ''2025-01-01T00:00:00.0000000Z'', N''محفظة نسائي بلون وردي جذاب'', NULL, N''female'', N''/assets/mock-products/wallet/women-pink-wallet.jpg'', CAST(1 AS bit), CAST(1 AS bit), CAST(1 AS bit), N''محفظة وردية نسائي'', 260.0, N''women-pink-wallet'', ''2025-01-01T00:00:00.0000000Z''),
    (''aaaa0002-0002-0002-0002-000000000005'', N''wallet'', ''2025-01-01T00:00:00.0000000Z'', N''محفظة نسائي بلون بيج كلاسيكي'', NULL, N''female'', N''/assets/mock-products/wallet/women-beige-wallet.jpg'', CAST(1 AS bit), CAST(1 AS bit), CAST(1 AS bit), N''محفظة بيج نسائي'', 270.0, N''women-beige-wallet'', ''2025-01-01T00:00:00.0000000Z''),
    (''aaaa0002-0002-0002-0002-000000000006'', N''wallet'', ''2025-01-01T00:00:00.0000000Z'', N''محفظة نسائي بلمسة ذهبية أنيقة'', NULL, N''female'', N''/assets/mock-products/wallet/women-gold-wallet.jpg'', CAST(1 AS bit), CAST(1 AS bit), CAST(1 AS bit), N''محفظة ذهبية نسائي'', 290.0, N''women-gold-wallet'', ''2025-01-01T00:00:00.0000000Z''),
    (''aaaa0003-0003-0003-0003-000000000001'', N''mug'', ''2025-01-01T00:00:00.0000000Z'', N''مج أسود بتصميم رجالي مميز'', NULL, N''male'', N''/assets/mock-products/mug/men-black-mug.jpg'', CAST(1 AS bit), CAST(1 AS bit), CAST(1 AS bit), N''مج أسود رجالي'', 120.0, N''men-black-mug'', ''2025-01-01T00:00:00.0000000Z''),
    (''aaaa0003-0003-0003-0003-000000000002'', N''mug'', ''2025-01-01T00:00:00.0000000Z'', N''مج رمادي بلمسة عصرية'', NULL, N''male'', N''/assets/mock-products/mug/men-grey-mug.jpg'', CAST(1 AS bit), CAST(1 AS bit), CAST(1 AS bit), N''مج رمادي رجالي'', 120.0, N''men-grey-mug'', ''2025-01-01T00:00:00.0000000Z''),
    (''aaaa0003-0003-0003-0003-000000000003'', N''mug'', ''2025-01-01T00:00:00.0000000Z'', N''مج بلون كحلي أنيق'', NULL, N''male'', N''/assets/mock-products/mug/men-navy-mug.jpg'', CAST(1 AS bit), CAST(1 AS bit), CAST(1 AS bit), N''مج كحلي رجالي'', 130.0, N''men-navy-mug'', ''2025-01-01T00:00:00.0000000Z''),
    (''aaaa0003-0003-0003-0003-000000000004'', N''mug'', ''2025-01-01T00:00:00.0000000Z'', N''مج وردي بتصميم ناعم'', NULL, N''female'', N''/assets/mock-products/mug/women-pink-mug.jpg'', CAST(1 AS bit), CAST(1 AS bit), CAST(1 AS bit), N''مج وردي نسائي'', 120.0, N''women-pink-mug'', ''2025-01-01T00:00:00.0000000Z''),
    (''aaaa0003-0003-0003-0003-000000000005'', N''mug'', ''2025-01-01T00:00:00.0000000Z'', N''مج بتصميم مرمري فاخر'', NULL, N''female'', N''/assets/mock-products/mug/women-marble-mug.jpg'', CAST(1 AS bit), CAST(1 AS bit), CAST(1 AS bit), N''مج مرمري نسائي'', 140.0, N''women-marble-mug'', ''2025-01-01T00:00:00.0000000Z''),
    (''aaaa0003-0003-0003-0003-000000000006'', N''mug'', ''2025-01-01T00:00:00.0000000Z'', N''مج بنقشة زهور رقيقة'', NULL, N''female'', N''/assets/mock-products/mug/women-floral-mug.jpg'', CAST(1 AS bit), CAST(1 AS bit), CAST(1 AS bit), N''مج فلورال نسائي'', 130.0, N''women-floral-mug'', ''2025-01-01T00:00:00.0000000Z''),
    (''aaaa0004-0004-0004-0004-000000000001'', N''necklace'', ''2025-01-01T00:00:00.0000000Z'', N''سلسلة رجالي من الفضة الخالصة'', NULL, N''male'', N''/assets/mock-products/necklace/men-silver-chain.jpg'', CAST(1 AS bit), CAST(1 AS bit), CAST(1 AS bit), N''سلسلة فضية رجالي'', 220.0, N''men-silver-chain'', ''2025-01-01T00:00:00.0000000Z''),
    (''aaaa0004-0004-0004-0004-000000000002'', N''necklace'', ''2025-01-01T00:00:00.0000000Z'', N''سلسلة رجالي من الستانلس ستيل'', NULL, N''male'', N''/assets/mock-products/necklace/men-steel-chain.jpg'', CAST(1 AS bit), CAST(1 AS bit), CAST(1 AS bit), N''سلسلة ستيل رجالي'', 180.0, N''men-steel-chain'', ''2025-01-01T00:00:00.0000000Z''),
    (''aaaa0004-0004-0004-0004-000000000003'', N''necklace'', ''2025-01-01T00:00:00.0000000Z'', N''سلسلة رجالي بتصميم بسيط'', NULL, N''male'', N''/assets/mock-products/necklace/men-minimal-chain.jpg'', CAST(1 AS bit), CAST(1 AS bit), CAST(1 AS bit), N''سلسلة مينيمال رجالي'', 200.0, N''men-minimal-chain'', ''2025-01-01T00:00:00.0000000Z''),
    (''aaaa0004-0004-0004-0004-000000000004'', N''necklace'', ''2025-01-01T00:00:00.0000000Z'', N''عقد نسائي بتعليقة قلب رقيقة'', NULL, N''female'', N''/assets/mock-products/necklace/women-heart-necklace.jpg'', CAST(1 AS bit), CAST(1 AS bit), CAST(1 AS bit), N''عقد قلب نسائي'', 250.0, N''women-heart-necklace'', ''2025-01-01T00:00:00.0000000Z''),
    (''aaaa0004-0004-0004-0004-000000000005'', N''necklace'', ''2025-01-01T00:00:00.0000000Z'', N''عقد نسائي بلؤلؤ طبيعي'', NULL, N''female'', N''/assets/mock-products/necklace/women-pearl-necklace.jpg'', CAST(1 AS bit), CAST(1 AS bit), CAST(1 AS bit), N''عقد لؤلؤ نسائي'', 320.0, N''women-pearl-necklace'', ''2025-01-01T00:00:00.0000000Z''),
    (''aaaa0004-0004-0004-0004-000000000006'', N''necklace'', ''2025-01-01T00:00:00.0000000Z'', N''عقد نسائي بتعليقة ذهبية أنيقة'', NULL, N''female'', N''/assets/mock-products/necklace/women-gold-pendant.jpg'', CAST(1 AS bit), CAST(1 AS bit), CAST(1 AS bit), N''عقد ذهبي نسائي'', 280.0, N''women-gold-pendant'', ''2025-01-01T00:00:00.0000000Z''),
    (''aaaa0005-0005-0005-0005-000000000001'', N''ring'', ''2025-01-01T00:00:00.0000000Z'', N''خاتم رجالي من التيتانيوم المتين'', NULL, N''male'', N''/assets/mock-products/ring/men-titanium-ring.jpg'', CAST(1 AS bit), CAST(1 AS bit), CAST(1 AS bit), N''خاتم تيتانيوم رجالي'', 200.0, N''men-titanium-ring'', ''2025-01-01T00:00:00.0000000Z''),
    (''aaaa0005-0005-0005-0005-000000000002'', N''ring'', ''2025-01-01T00:00:00.0000000Z'', N''خاتم رجالي فضي بتصميم كلاسيكي'', NULL, N''male'', N''/assets/mock-products/ring/men-silver-ring.jpg'', CAST(1 AS bit), CAST(1 AS bit), CAST(1 AS bit), N''خاتم فضي رجالي'', 180.0, N''men-silver-ring'', ''2025-01-01T00:00:00.0000000Z''),
    (''aaaa0005-0005-0005-0005-000000000003'', N''ring'', ''2025-01-01T00:00:00.0000000Z'', N''خاتم رجالي أسود أنيق'', NULL, N''male'', N''/assets/mock-products/ring/men-black-ring.jpg'', CAST(1 AS bit), CAST(1 AS bit), CAST(1 AS bit), N''خاتم أسود رجالي'', 190.0, N''men-black-ring'', ''2025-01-01T00:00:00.0000000Z''),
    (''aaaa0005-0005-0005-0005-000000000004'', N''ring'', ''2025-01-01T00:00:00.0000000Z'', N''خاتم نسائي مرصع بالألماس'', NULL, N''female'', N''/assets/mock-products/ring/women-diamond-ring.jpg'', CAST(1 AS bit), CAST(1 AS bit), CAST(1 AS bit), N''خاتم ألماس نسائي'', 350.0, N''women-diamond-ring'', ''2025-01-01T00:00:00.0000000Z''),
    (''aaaa0005-0005-0005-0005-000000000005'', N''ring'', ''2025-01-01T00:00:00.0000000Z'', N''خاتم نسائي ذهبي رقيق'', NULL, N''female'', N''/assets/mock-products/ring/women-gold-ring.jpg'', CAST(1 AS bit), CAST(1 AS bit), CAST(1 AS bit), N''خاتم ذهبي نسائي'', 280.0, N''women-gold-ring'', ''2025-01-01T00:00:00.0000000Z''),
    (''aaaa0005-0005-0005-0005-000000000006'', N''ring'', ''2025-01-01T00:00:00.0000000Z'', N''خاتم نسائي فضي بتصميم مميز'', NULL, N''female'', N''/assets/mock-products/ring/women-silver-ring.jpg'', CAST(1 AS bit), CAST(1 AS bit), CAST(1 AS bit), N''خاتم فضي نسائي'', 220.0, N''women-silver-ring'', ''2025-01-01T00:00:00.0000000Z'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Category', N'CreatedAt', N'Description', N'GalleryJson', N'Gender', N'ImageUrl', N'IsActive', N'IsBuilderItem', N'IsStandalone', N'Name', N'Price', N'Slug', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[Products]'))
        SET IDENTITY_INSERT [Products] OFF;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306083501_ProductCatalogRefactor'
)
BEGIN
    CREATE INDEX [IX_Products_IsBuilderItem] ON [Products] ([IsBuilderItem]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306083501_ProductCatalogRefactor'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260306083501_ProductCatalogRefactor', N'8.0.10');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306085256_UpdateProductImageWebp'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [ImageUrl] = N''/assets/mock-products/watch/men-classic-gold-watch.webp''
    WHERE [Id] = ''aaaa0001-0001-0001-0001-000000000001'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306085256_UpdateProductImageWebp'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [ImageUrl] = N''/assets/mock-products/watch/men-black-steel-watch.webp''
    WHERE [Id] = ''aaaa0001-0001-0001-0001-000000000002'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306085256_UpdateProductImageWebp'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [ImageUrl] = N''/assets/mock-products/watch/men-silver-sport-watch.webp''
    WHERE [Id] = ''aaaa0001-0001-0001-0001-000000000003'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306085256_UpdateProductImageWebp'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [ImageUrl] = N''/assets/mock-products/watch/women-rose-gold-watch.webp''
    WHERE [Id] = ''aaaa0001-0001-0001-0001-000000000004'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306085256_UpdateProductImageWebp'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [ImageUrl] = N''/assets/mock-products/watch/women-minimal-watch.webp''
    WHERE [Id] = ''aaaa0001-0001-0001-0001-000000000005'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306085256_UpdateProductImageWebp'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [ImageUrl] = N''/assets/mock-products/watch/women-pearl-watch.webp''
    WHERE [Id] = ''aaaa0001-0001-0001-0001-000000000006'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306085256_UpdateProductImageWebp'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [ImageUrl] = N''/assets/mock-products/wallet/men-brown-leather-wallet.webp''
    WHERE [Id] = ''aaaa0002-0002-0002-0002-000000000001'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306085256_UpdateProductImageWebp'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [ImageUrl] = N''/assets/mock-products/wallet/men-black-slim-wallet.webp''
    WHERE [Id] = ''aaaa0002-0002-0002-0002-000000000002'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306085256_UpdateProductImageWebp'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [ImageUrl] = N''/assets/mock-products/wallet/men-classic-wallet.webp''
    WHERE [Id] = ''aaaa0002-0002-0002-0002-000000000003'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306085256_UpdateProductImageWebp'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [ImageUrl] = N''/assets/mock-products/wallet/women-pink-wallet.webp''
    WHERE [Id] = ''aaaa0002-0002-0002-0002-000000000004'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306085256_UpdateProductImageWebp'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [ImageUrl] = N''/assets/mock-products/wallet/women-beige-wallet.webp''
    WHERE [Id] = ''aaaa0002-0002-0002-0002-000000000005'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306085256_UpdateProductImageWebp'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [ImageUrl] = N''/assets/mock-products/wallet/women-gold-wallet.webp''
    WHERE [Id] = ''aaaa0002-0002-0002-0002-000000000006'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306085256_UpdateProductImageWebp'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [ImageUrl] = N''/assets/mock-products/mug/men-black-mug.webp''
    WHERE [Id] = ''aaaa0003-0003-0003-0003-000000000001'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306085256_UpdateProductImageWebp'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [ImageUrl] = N''/assets/mock-products/mug/men-grey-mug.webp''
    WHERE [Id] = ''aaaa0003-0003-0003-0003-000000000002'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306085256_UpdateProductImageWebp'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [ImageUrl] = N''/assets/mock-products/mug/men-navy-mug.webp''
    WHERE [Id] = ''aaaa0003-0003-0003-0003-000000000003'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306085256_UpdateProductImageWebp'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [ImageUrl] = N''/assets/mock-products/mug/women-pink-mug.webp''
    WHERE [Id] = ''aaaa0003-0003-0003-0003-000000000004'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306085256_UpdateProductImageWebp'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [ImageUrl] = N''/assets/mock-products/mug/women-marble-mug.webp''
    WHERE [Id] = ''aaaa0003-0003-0003-0003-000000000005'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306085256_UpdateProductImageWebp'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [ImageUrl] = N''/assets/mock-products/mug/women-floral-mug.webp''
    WHERE [Id] = ''aaaa0003-0003-0003-0003-000000000006'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306085256_UpdateProductImageWebp'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [ImageUrl] = N''/assets/mock-products/necklace/men-silver-chain.webp''
    WHERE [Id] = ''aaaa0004-0004-0004-0004-000000000001'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306085256_UpdateProductImageWebp'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [ImageUrl] = N''/assets/mock-products/necklace/men-steel-chain.webp''
    WHERE [Id] = ''aaaa0004-0004-0004-0004-000000000002'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306085256_UpdateProductImageWebp'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [ImageUrl] = N''/assets/mock-products/necklace/men-minimal-chain.webp''
    WHERE [Id] = ''aaaa0004-0004-0004-0004-000000000003'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306085256_UpdateProductImageWebp'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [ImageUrl] = N''/assets/mock-products/necklace/women-heart-necklace.webp''
    WHERE [Id] = ''aaaa0004-0004-0004-0004-000000000004'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306085256_UpdateProductImageWebp'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [ImageUrl] = N''/assets/mock-products/necklace/women-pearl-necklace.webp''
    WHERE [Id] = ''aaaa0004-0004-0004-0004-000000000005'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306085256_UpdateProductImageWebp'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [ImageUrl] = N''/assets/mock-products/necklace/women-gold-pendant.webp''
    WHERE [Id] = ''aaaa0004-0004-0004-0004-000000000006'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306085256_UpdateProductImageWebp'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [ImageUrl] = N''/assets/mock-products/ring/men-titanium-ring.webp''
    WHERE [Id] = ''aaaa0005-0005-0005-0005-000000000001'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306085256_UpdateProductImageWebp'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [ImageUrl] = N''/assets/mock-products/ring/men-silver-ring.webp''
    WHERE [Id] = ''aaaa0005-0005-0005-0005-000000000002'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306085256_UpdateProductImageWebp'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [ImageUrl] = N''/assets/mock-products/ring/men-black-ring.webp''
    WHERE [Id] = ''aaaa0005-0005-0005-0005-000000000003'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306085256_UpdateProductImageWebp'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [ImageUrl] = N''/assets/mock-products/ring/women-diamond-ring.webp''
    WHERE [Id] = ''aaaa0005-0005-0005-0005-000000000004'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306085256_UpdateProductImageWebp'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [ImageUrl] = N''/assets/mock-products/ring/women-gold-ring.webp''
    WHERE [Id] = ''aaaa0005-0005-0005-0005-000000000005'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306085256_UpdateProductImageWebp'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [ImageUrl] = N''/assets/mock-products/ring/women-silver-ring.webp''
    WHERE [Id] = ''aaaa0005-0005-0005-0005-000000000006'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306085256_UpdateProductImageWebp'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260306085256_UpdateProductImageWebp', N'8.0.10');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306221137_FixAdminPasswordHash'
)
BEGIN
    EXEC(N'UPDATE [Users] SET [PasswordHash] = N''$2a$11$9Z5R6K39Y4AWgmB6aFyvh.CjYm6EEESBzyuBTGQrguHhFa48c642S''
    WHERE [Id] = ''d4e5f6a7-b8c9-0123-defa-234567890123'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260306221137_FixAdminPasswordHash'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260306221137_FixAdminPasswordHash', N'8.0.10');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307000037_AddReviews'
)
BEGIN
    CREATE TABLE [Reviews] (
        [Id] uniqueidentifier NOT NULL DEFAULT (NEWID()),
        [UserId] uniqueidentifier NOT NULL,
        [ProductId] uniqueidentifier NOT NULL,
        [Rating] int NOT NULL,
        [Comment] nvarchar(1000) NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        CONSTRAINT [PK_Reviews] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Reviews_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_Reviews_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307000037_AddReviews'
)
BEGIN
    CREATE INDEX [IX_Reviews_ProductId] ON [Reviews] ([ProductId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307000037_AddReviews'
)
BEGIN
    CREATE INDEX [IX_Reviews_UserId] ON [Reviews] ([UserId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307000037_AddReviews'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Reviews_UserId_ProductId] ON [Reviews] ([UserId], [ProductId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307000037_AddReviews'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260307000037_AddReviews', N'8.0.10');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307001626_AddGovernorates'
)
BEGIN
    DECLARE @var0 sysname;
    SELECT @var0 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Addresses]') AND [c].[name] = N'City');
    IF @var0 IS NOT NULL EXEC(N'ALTER TABLE [Addresses] DROP CONSTRAINT [' + @var0 + '];');
    ALTER TABLE [Addresses] DROP COLUMN [City];
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307001626_AddGovernorates'
)
BEGIN
    ALTER TABLE [Addresses] ADD [GovernorateId] uniqueidentifier NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307001626_AddGovernorates'
)
BEGIN
    CREATE TABLE [Governorates] (
        [Id] uniqueidentifier NOT NULL DEFAULT (NEWID()),
        [Name] nvarchar(100) NOT NULL,
        [ShippingCost] decimal(18,2) NOT NULL,
        [IsActive] bit NOT NULL DEFAULT CAST(1 AS bit),
        CONSTRAINT [PK_Governorates] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307001626_AddGovernorates'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'IsActive', N'Name', N'ShippingCost') AND [object_id] = OBJECT_ID(N'[Governorates]'))
        SET IDENTITY_INSERT [Governorates] ON;
    EXEC(N'INSERT INTO [Governorates] ([Id], [IsActive], [Name], [ShippingCost])
    VALUES (''a0000000-0000-0000-0000-000000000001'', CAST(1 AS bit), N''القاهرة'', 50.0),
    (''a0000000-0000-0000-0000-000000000002'', CAST(1 AS bit), N''الجيزة'', 50.0),
    (''a0000000-0000-0000-0000-000000000003'', CAST(1 AS bit), N''الإسكندرية'', 60.0),
    (''a0000000-0000-0000-0000-000000000004'', CAST(1 AS bit), N''الدقهلية'', 60.0),
    (''a0000000-0000-0000-0000-000000000005'', CAST(1 AS bit), N''البحيرة'', 65.0),
    (''a0000000-0000-0000-0000-000000000006'', CAST(1 AS bit), N''المنيا'', 70.0),
    (''a0000000-0000-0000-0000-000000000007'', CAST(1 AS bit), N''القليوبية'', 50.0),
    (''a0000000-0000-0000-0000-000000000008'', CAST(1 AS bit), N''الشرقية'', 60.0),
    (''a0000000-0000-0000-0000-000000000009'', CAST(1 AS bit), N''الغربية'', 60.0),
    (''a0000000-0000-0000-0000-00000000000a'', CAST(1 AS bit), N''المنوفية'', 55.0),
    (''a0000000-0000-0000-0000-00000000000b'', CAST(1 AS bit), N''كفر الشيخ'', 65.0),
    (''a0000000-0000-0000-0000-00000000000c'', CAST(1 AS bit), N''الفيوم'', 65.0),
    (''a0000000-0000-0000-0000-00000000000d'', CAST(1 AS bit), N''بني سويف'', 65.0),
    (''a0000000-0000-0000-0000-00000000000e'', CAST(1 AS bit), N''أسيوط'', 75.0),
    (''a0000000-0000-0000-0000-00000000000f'', CAST(1 AS bit), N''سوهاج'', 75.0),
    (''a0000000-0000-0000-0000-000000000010'', CAST(1 AS bit), N''قنا'', 80.0),
    (''a0000000-0000-0000-0000-000000000011'', CAST(1 AS bit), N''الأقصر'', 80.0),
    (''a0000000-0000-0000-0000-000000000012'', CAST(1 AS bit), N''أسوان'', 85.0),
    (''a0000000-0000-0000-0000-000000000013'', CAST(1 AS bit), N''دمياط'', 60.0),
    (''a0000000-0000-0000-0000-000000000014'', CAST(1 AS bit), N''بورسعيد'', 60.0),
    (''a0000000-0000-0000-0000-000000000015'', CAST(1 AS bit), N''الإسماعيلية'', 60.0),
    (''a0000000-0000-0000-0000-000000000016'', CAST(1 AS bit), N''السويس'', 60.0),
    (''a0000000-0000-0000-0000-000000000017'', CAST(1 AS bit), N''شمال سيناء'', 80.0),
    (''a0000000-0000-0000-0000-000000000018'', CAST(1 AS bit), N''جنوب سيناء'', 85.0),
    (''a0000000-0000-0000-0000-000000000019'', CAST(1 AS bit), N''مطروح'', 80.0),
    (''a0000000-0000-0000-0000-00000000001a'', CAST(1 AS bit), N''الوادي الجديد'', 90.0),
    (''a0000000-0000-0000-0000-00000000001b'', CAST(1 AS bit), N''البحر الأحمر'', 85.0)');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'IsActive', N'Name', N'ShippingCost') AND [object_id] = OBJECT_ID(N'[Governorates]'))
        SET IDENTITY_INSERT [Governorates] OFF;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307001626_AddGovernorates'
)
BEGIN
    CREATE INDEX [IX_Addresses_GovernorateId] ON [Addresses] ([GovernorateId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307001626_AddGovernorates'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Governorates_Name] ON [Governorates] ([Name]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307001626_AddGovernorates'
)
BEGIN
    UPDATE Addresses SET GovernorateId = 'a0000000-0000-0000-0000-000000000001' WHERE GovernorateId = '00000000-0000-0000-0000-000000000000'
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307001626_AddGovernorates'
)
BEGIN
    ALTER TABLE [Addresses] ADD CONSTRAINT [FK_Addresses_Governorates_GovernorateId] FOREIGN KEY ([GovernorateId]) REFERENCES [Governorates] ([Id]) ON DELETE NO ACTION;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307001626_AddGovernorates'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260307001626_AddGovernorates', N'8.0.10');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307090043_AddProductCustomization'
)
BEGIN
    ALTER TABLE [Products] ADD [IsCustomizable] bit NOT NULL DEFAULT CAST(0 AS bit);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307090043_AddProductCustomization'
)
BEGIN
    CREATE TABLE [CategoryCustomizationPrices] (
        [Id] uniqueidentifier NOT NULL DEFAULT (NEWID()),
        [Category] nvarchar(50) NOT NULL,
        [Price] decimal(10,2) NOT NULL,
        CONSTRAINT [PK_CategoryCustomizationPrices] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307090043_AddProductCustomization'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(0 AS bit)
    WHERE [Id] = ''aaaa0001-0001-0001-0001-000000000001'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307090043_AddProductCustomization'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(0 AS bit)
    WHERE [Id] = ''aaaa0001-0001-0001-0001-000000000002'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307090043_AddProductCustomization'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(0 AS bit)
    WHERE [Id] = ''aaaa0001-0001-0001-0001-000000000003'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307090043_AddProductCustomization'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(0 AS bit)
    WHERE [Id] = ''aaaa0001-0001-0001-0001-000000000004'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307090043_AddProductCustomization'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(0 AS bit)
    WHERE [Id] = ''aaaa0001-0001-0001-0001-000000000005'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307090043_AddProductCustomization'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(0 AS bit)
    WHERE [Id] = ''aaaa0001-0001-0001-0001-000000000006'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307090043_AddProductCustomization'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(0 AS bit)
    WHERE [Id] = ''aaaa0002-0002-0002-0002-000000000001'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307090043_AddProductCustomization'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(0 AS bit)
    WHERE [Id] = ''aaaa0002-0002-0002-0002-000000000002'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307090043_AddProductCustomization'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(0 AS bit)
    WHERE [Id] = ''aaaa0002-0002-0002-0002-000000000003'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307090043_AddProductCustomization'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(0 AS bit)
    WHERE [Id] = ''aaaa0002-0002-0002-0002-000000000004'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307090043_AddProductCustomization'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(0 AS bit)
    WHERE [Id] = ''aaaa0002-0002-0002-0002-000000000005'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307090043_AddProductCustomization'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(0 AS bit)
    WHERE [Id] = ''aaaa0002-0002-0002-0002-000000000006'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307090043_AddProductCustomization'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(0 AS bit)
    WHERE [Id] = ''aaaa0003-0003-0003-0003-000000000001'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307090043_AddProductCustomization'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(0 AS bit)
    WHERE [Id] = ''aaaa0003-0003-0003-0003-000000000002'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307090043_AddProductCustomization'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(0 AS bit)
    WHERE [Id] = ''aaaa0003-0003-0003-0003-000000000003'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307090043_AddProductCustomization'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(0 AS bit)
    WHERE [Id] = ''aaaa0003-0003-0003-0003-000000000004'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307090043_AddProductCustomization'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(0 AS bit)
    WHERE [Id] = ''aaaa0003-0003-0003-0003-000000000005'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307090043_AddProductCustomization'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(0 AS bit)
    WHERE [Id] = ''aaaa0003-0003-0003-0003-000000000006'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307090043_AddProductCustomization'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(0 AS bit)
    WHERE [Id] = ''aaaa0004-0004-0004-0004-000000000001'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307090043_AddProductCustomization'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(0 AS bit)
    WHERE [Id] = ''aaaa0004-0004-0004-0004-000000000002'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307090043_AddProductCustomization'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(0 AS bit)
    WHERE [Id] = ''aaaa0004-0004-0004-0004-000000000003'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307090043_AddProductCustomization'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(0 AS bit)
    WHERE [Id] = ''aaaa0004-0004-0004-0004-000000000004'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307090043_AddProductCustomization'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(0 AS bit)
    WHERE [Id] = ''aaaa0004-0004-0004-0004-000000000005'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307090043_AddProductCustomization'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(0 AS bit)
    WHERE [Id] = ''aaaa0004-0004-0004-0004-000000000006'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307090043_AddProductCustomization'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(0 AS bit)
    WHERE [Id] = ''aaaa0005-0005-0005-0005-000000000001'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307090043_AddProductCustomization'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(0 AS bit)
    WHERE [Id] = ''aaaa0005-0005-0005-0005-000000000002'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307090043_AddProductCustomization'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(0 AS bit)
    WHERE [Id] = ''aaaa0005-0005-0005-0005-000000000003'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307090043_AddProductCustomization'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(0 AS bit)
    WHERE [Id] = ''aaaa0005-0005-0005-0005-000000000004'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307090043_AddProductCustomization'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(0 AS bit)
    WHERE [Id] = ''aaaa0005-0005-0005-0005-000000000005'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307090043_AddProductCustomization'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(0 AS bit)
    WHERE [Id] = ''aaaa0005-0005-0005-0005-000000000006'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307090043_AddProductCustomization'
)
BEGIN
    CREATE INDEX [IX_Products_IsCustomizable] ON [Products] ([IsCustomizable]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307090043_AddProductCustomization'
)
BEGIN
    CREATE UNIQUE INDEX [IX_CategoryCustomizationPrices_Category] ON [CategoryCustomizationPrices] ([Category]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307090043_AddProductCustomization'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260307090043_AddProductCustomization', N'8.0.10');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307092131_SeedCustomizationData'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Category', N'Price') AND [object_id] = OBJECT_ID(N'[CategoryCustomizationPrices]'))
        SET IDENTITY_INSERT [CategoryCustomizationPrices] ON;
    EXEC(N'INSERT INTO [CategoryCustomizationPrices] ([Id], [Category], [Price])
    VALUES (''cc000000-0000-0000-0000-000000000001'', N''watch'', 50.0),
    (''cc000000-0000-0000-0000-000000000002'', N''wallet'', 40.0),
    (''cc000000-0000-0000-0000-000000000003'', N''mug'', 30.0),
    (''cc000000-0000-0000-0000-000000000004'', N''necklace'', 45.0),
    (''cc000000-0000-0000-0000-000000000005'', N''ring'', 35.0)');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Category', N'Price') AND [object_id] = OBJECT_ID(N'[CategoryCustomizationPrices]'))
        SET IDENTITY_INSERT [CategoryCustomizationPrices] OFF;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307092131_SeedCustomizationData'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
    WHERE [Id] = ''aaaa0001-0001-0001-0001-000000000001'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307092131_SeedCustomizationData'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
    WHERE [Id] = ''aaaa0001-0001-0001-0001-000000000002'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307092131_SeedCustomizationData'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
    WHERE [Id] = ''aaaa0001-0001-0001-0001-000000000004'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307092131_SeedCustomizationData'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
    WHERE [Id] = ''aaaa0001-0001-0001-0001-000000000005'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307092131_SeedCustomizationData'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
    WHERE [Id] = ''aaaa0001-0001-0001-0001-000000000006'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307092131_SeedCustomizationData'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
    WHERE [Id] = ''aaaa0002-0002-0002-0002-000000000001'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307092131_SeedCustomizationData'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
    WHERE [Id] = ''aaaa0002-0002-0002-0002-000000000002'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307092131_SeedCustomizationData'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
    WHERE [Id] = ''aaaa0002-0002-0002-0002-000000000004'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307092131_SeedCustomizationData'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
    WHERE [Id] = ''aaaa0002-0002-0002-0002-000000000005'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307092131_SeedCustomizationData'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
    WHERE [Id] = ''aaaa0002-0002-0002-0002-000000000006'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307092131_SeedCustomizationData'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
    WHERE [Id] = ''aaaa0003-0003-0003-0003-000000000001'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307092131_SeedCustomizationData'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
    WHERE [Id] = ''aaaa0003-0003-0003-0003-000000000002'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307092131_SeedCustomizationData'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
    WHERE [Id] = ''aaaa0003-0003-0003-0003-000000000003'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307092131_SeedCustomizationData'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
    WHERE [Id] = ''aaaa0003-0003-0003-0003-000000000004'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307092131_SeedCustomizationData'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
    WHERE [Id] = ''aaaa0003-0003-0003-0003-000000000005'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307092131_SeedCustomizationData'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
    WHERE [Id] = ''aaaa0004-0004-0004-0004-000000000001'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307092131_SeedCustomizationData'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
    WHERE [Id] = ''aaaa0004-0004-0004-0004-000000000003'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307092131_SeedCustomizationData'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
    WHERE [Id] = ''aaaa0004-0004-0004-0004-000000000004'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307092131_SeedCustomizationData'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
    WHERE [Id] = ''aaaa0004-0004-0004-0004-000000000005'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307092131_SeedCustomizationData'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
    WHERE [Id] = ''aaaa0004-0004-0004-0004-000000000006'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307092131_SeedCustomizationData'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
    WHERE [Id] = ''aaaa0005-0005-0005-0005-000000000001'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307092131_SeedCustomizationData'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
    WHERE [Id] = ''aaaa0005-0005-0005-0005-000000000003'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307092131_SeedCustomizationData'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
    WHERE [Id] = ''aaaa0005-0005-0005-0005-000000000004'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307092131_SeedCustomizationData'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
    WHERE [Id] = ''aaaa0005-0005-0005-0005-000000000005'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307092131_SeedCustomizationData'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260307092131_SeedCustomizationData', N'8.0.10');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307102352_AddSystemSettings'
)
BEGIN
    CREATE TABLE [SystemSettings] (
        [Id] int NOT NULL IDENTITY,
        [Key] nvarchar(200) NOT NULL,
        [Value] nvarchar(max) NOT NULL,
        [UpdatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        CONSTRAINT [PK_SystemSettings] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307102352_AddSystemSettings'
)
BEGIN
    CREATE UNIQUE INDEX [IX_SystemSettings_Key] ON [SystemSettings] ([Key]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307102352_AddSystemSettings'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260307102352_AddSystemSettings', N'8.0.10');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313160221_AddBoxSlotLabelEn'
)
BEGIN
    ALTER TABLE [BoxSlots] ADD [LabelEn] nvarchar(max) NOT NULL DEFAULT N'';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313160221_AddBoxSlotLabelEn'
)
BEGIN
    EXEC(N'UPDATE [BoxSlots] SET [LabelEn] = N''Watch''
    WHERE [Id] = ''11111111-0001-0001-0001-000000000001'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313160221_AddBoxSlotLabelEn'
)
BEGIN
    EXEC(N'UPDATE [BoxSlots] SET [LabelEn] = N''Wallet''
    WHERE [Id] = ''11111111-0001-0001-0001-000000000002'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313160221_AddBoxSlotLabelEn'
)
BEGIN
    EXEC(N'UPDATE [BoxSlots] SET [LabelEn] = N''Mug''
    WHERE [Id] = ''11111111-0001-0001-0001-000000000003'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313160221_AddBoxSlotLabelEn'
)
BEGIN
    EXEC(N'UPDATE [BoxSlots] SET [LabelEn] = N''Necklace''
    WHERE [Id] = ''11111111-0001-0001-0001-000000000004'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313160221_AddBoxSlotLabelEn'
)
BEGIN
    EXEC(N'UPDATE [BoxSlots] SET [LabelEn] = N''Ring''
    WHERE [Id] = ''11111111-0001-0001-0001-000000000005'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313160221_AddBoxSlotLabelEn'
)
BEGIN
    EXEC(N'UPDATE [BoxSlots] SET [LabelEn] = N''Watch''
    WHERE [Id] = ''22222222-0002-0002-0002-000000000001'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313160221_AddBoxSlotLabelEn'
)
BEGIN
    EXEC(N'UPDATE [BoxSlots] SET [LabelEn] = N''Wallet''
    WHERE [Id] = ''22222222-0002-0002-0002-000000000002'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313160221_AddBoxSlotLabelEn'
)
BEGIN
    EXEC(N'UPDATE [BoxSlots] SET [LabelEn] = N''Mug''
    WHERE [Id] = ''22222222-0002-0002-0002-000000000003'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313160221_AddBoxSlotLabelEn'
)
BEGIN
    EXEC(N'UPDATE [BoxSlots] SET [LabelEn] = N''Necklace''
    WHERE [Id] = ''22222222-0002-0002-0002-000000000004'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313160221_AddBoxSlotLabelEn'
)
BEGIN
    EXEC(N'UPDATE [BoxSlots] SET [LabelEn] = N''Ring''
    WHERE [Id] = ''22222222-0002-0002-0002-000000000005'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313160221_AddBoxSlotLabelEn'
)
BEGIN
    EXEC(N'UPDATE [BoxSlots] SET [LabelEn] = N''Watch for Him''
    WHERE [Id] = ''33333333-0003-0003-0003-000000000001'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313160221_AddBoxSlotLabelEn'
)
BEGIN
    EXEC(N'UPDATE [BoxSlots] SET [LabelEn] = N''Watch for Her''
    WHERE [Id] = ''33333333-0003-0003-0003-000000000002'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313160221_AddBoxSlotLabelEn'
)
BEGIN
    EXEC(N'UPDATE [BoxSlots] SET [LabelEn] = N''Wallet''
    WHERE [Id] = ''33333333-0003-0003-0003-000000000003'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313160221_AddBoxSlotLabelEn'
)
BEGIN
    EXEC(N'UPDATE [BoxSlots] SET [LabelEn] = N''Mug for Him''
    WHERE [Id] = ''33333333-0003-0003-0003-000000000004'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313160221_AddBoxSlotLabelEn'
)
BEGIN
    EXEC(N'UPDATE [BoxSlots] SET [LabelEn] = N''Mug for Her''
    WHERE [Id] = ''33333333-0003-0003-0003-000000000005'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313160221_AddBoxSlotLabelEn'
)
BEGIN
    EXEC(N'UPDATE [BoxSlots] SET [LabelEn] = N''Necklace''
    WHERE [Id] = ''33333333-0003-0003-0003-000000000006'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313160221_AddBoxSlotLabelEn'
)
BEGIN
    EXEC(N'UPDATE [BoxSlots] SET [LabelEn] = N''Ring''
    WHERE [Id] = ''33333333-0003-0003-0003-000000000007'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313160221_AddBoxSlotLabelEn'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260313160221_AddBoxSlotLabelEn', N'8.0.10');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    ALTER TABLE [Products] ADD [DescriptionEn] nvarchar(max) NOT NULL DEFAULT N'';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    ALTER TABLE [Products] ADD [NameEn] nvarchar(max) NOT NULL DEFAULT N'';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    ALTER TABLE [Notifications] ADD [MessageEn] nvarchar(max) NOT NULL DEFAULT N'';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    ALTER TABLE [Notifications] ADD [TitleEn] nvarchar(max) NOT NULL DEFAULT N'';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    ALTER TABLE [Governorates] ADD [NameEn] nvarchar(max) NOT NULL DEFAULT N'';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    ALTER TABLE [BoxTypes] ADD [NameEn] nvarchar(max) NOT NULL DEFAULT N'';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [BoxTypes] SET [NameEn] = N''''
    WHERE [Id] = ''a1b2c3d4-e5f6-7890-abcd-ef1234567890'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [BoxTypes] SET [NameEn] = N''''
    WHERE [Id] = ''b2c3d4e5-f6a7-8901-bcde-f12345678901'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [BoxTypes] SET [NameEn] = N''''
    WHERE [Id] = ''c3d4e5f6-a7b8-9012-cdef-123456789012'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''''
    WHERE [Id] = ''a0000000-0000-0000-0000-000000000001'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''''
    WHERE [Id] = ''a0000000-0000-0000-0000-000000000002'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''''
    WHERE [Id] = ''a0000000-0000-0000-0000-000000000003'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''''
    WHERE [Id] = ''a0000000-0000-0000-0000-000000000004'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''''
    WHERE [Id] = ''a0000000-0000-0000-0000-000000000005'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''''
    WHERE [Id] = ''a0000000-0000-0000-0000-000000000006'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''''
    WHERE [Id] = ''a0000000-0000-0000-0000-000000000007'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''''
    WHERE [Id] = ''a0000000-0000-0000-0000-000000000008'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''''
    WHERE [Id] = ''a0000000-0000-0000-0000-000000000009'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''''
    WHERE [Id] = ''a0000000-0000-0000-0000-00000000000a'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''''
    WHERE [Id] = ''a0000000-0000-0000-0000-00000000000b'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''''
    WHERE [Id] = ''a0000000-0000-0000-0000-00000000000c'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''''
    WHERE [Id] = ''a0000000-0000-0000-0000-00000000000d'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''''
    WHERE [Id] = ''a0000000-0000-0000-0000-00000000000e'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''''
    WHERE [Id] = ''a0000000-0000-0000-0000-00000000000f'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''''
    WHERE [Id] = ''a0000000-0000-0000-0000-000000000010'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''''
    WHERE [Id] = ''a0000000-0000-0000-0000-000000000011'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''''
    WHERE [Id] = ''a0000000-0000-0000-0000-000000000012'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''''
    WHERE [Id] = ''a0000000-0000-0000-0000-000000000013'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''''
    WHERE [Id] = ''a0000000-0000-0000-0000-000000000014'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''''
    WHERE [Id] = ''a0000000-0000-0000-0000-000000000015'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''''
    WHERE [Id] = ''a0000000-0000-0000-0000-000000000016'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''''
    WHERE [Id] = ''a0000000-0000-0000-0000-000000000017'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''''
    WHERE [Id] = ''a0000000-0000-0000-0000-000000000018'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''''
    WHERE [Id] = ''a0000000-0000-0000-0000-000000000019'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''''
    WHERE [Id] = ''a0000000-0000-0000-0000-00000000001a'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''''
    WHERE [Id] = ''a0000000-0000-0000-0000-00000000001b'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N'''', [NameEn] = N''''
    WHERE [Id] = ''aaaa0001-0001-0001-0001-000000000001'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N'''', [NameEn] = N''''
    WHERE [Id] = ''aaaa0001-0001-0001-0001-000000000002'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N'''', [NameEn] = N''''
    WHERE [Id] = ''aaaa0001-0001-0001-0001-000000000003'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N'''', [NameEn] = N''''
    WHERE [Id] = ''aaaa0001-0001-0001-0001-000000000004'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N'''', [NameEn] = N''''
    WHERE [Id] = ''aaaa0001-0001-0001-0001-000000000005'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N'''', [NameEn] = N''''
    WHERE [Id] = ''aaaa0001-0001-0001-0001-000000000006'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N'''', [NameEn] = N''''
    WHERE [Id] = ''aaaa0002-0002-0002-0002-000000000001'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N'''', [NameEn] = N''''
    WHERE [Id] = ''aaaa0002-0002-0002-0002-000000000002'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N'''', [NameEn] = N''''
    WHERE [Id] = ''aaaa0002-0002-0002-0002-000000000003'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N'''', [NameEn] = N''''
    WHERE [Id] = ''aaaa0002-0002-0002-0002-000000000004'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N'''', [NameEn] = N''''
    WHERE [Id] = ''aaaa0002-0002-0002-0002-000000000005'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N'''', [NameEn] = N''''
    WHERE [Id] = ''aaaa0002-0002-0002-0002-000000000006'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N'''', [NameEn] = N''''
    WHERE [Id] = ''aaaa0003-0003-0003-0003-000000000001'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N'''', [NameEn] = N''''
    WHERE [Id] = ''aaaa0003-0003-0003-0003-000000000002'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N'''', [NameEn] = N''''
    WHERE [Id] = ''aaaa0003-0003-0003-0003-000000000003'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N'''', [NameEn] = N''''
    WHERE [Id] = ''aaaa0003-0003-0003-0003-000000000004'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N'''', [NameEn] = N''''
    WHERE [Id] = ''aaaa0003-0003-0003-0003-000000000005'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N'''', [NameEn] = N''''
    WHERE [Id] = ''aaaa0003-0003-0003-0003-000000000006'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N'''', [NameEn] = N''''
    WHERE [Id] = ''aaaa0004-0004-0004-0004-000000000001'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N'''', [NameEn] = N''''
    WHERE [Id] = ''aaaa0004-0004-0004-0004-000000000002'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N'''', [NameEn] = N''''
    WHERE [Id] = ''aaaa0004-0004-0004-0004-000000000003'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N'''', [NameEn] = N''''
    WHERE [Id] = ''aaaa0004-0004-0004-0004-000000000004'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N'''', [NameEn] = N''''
    WHERE [Id] = ''aaaa0004-0004-0004-0004-000000000005'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N'''', [NameEn] = N''''
    WHERE [Id] = ''aaaa0004-0004-0004-0004-000000000006'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N'''', [NameEn] = N''''
    WHERE [Id] = ''aaaa0005-0005-0005-0005-000000000001'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N'''', [NameEn] = N''''
    WHERE [Id] = ''aaaa0005-0005-0005-0005-000000000002'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N'''', [NameEn] = N''''
    WHERE [Id] = ''aaaa0005-0005-0005-0005-000000000003'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N'''', [NameEn] = N''''
    WHERE [Id] = ''aaaa0005-0005-0005-0005-000000000004'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N'''', [NameEn] = N''''
    WHERE [Id] = ''aaaa0005-0005-0005-0005-000000000005'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N'''', [NameEn] = N''''
    WHERE [Id] = ''aaaa0005-0005-0005-0005-000000000006'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313173627_AddProductEnFields'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260313173627_AddProductEnFields', N'8.0.10');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313221137_AddUserPreferredLang'
)
BEGIN
    ALTER TABLE [Users] ADD [PreferredLang] nvarchar(max) NOT NULL DEFAULT N'';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313221137_AddUserPreferredLang'
)
BEGIN
    EXEC(N'UPDATE [Users] SET [PreferredLang] = N''ar''
    WHERE [Id] = ''d4e5f6a7-b8c9-0123-defa-234567890123'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260313221137_AddUserPreferredLang'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260313221137_AddUserPreferredLang', N'8.0.10');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [BoxTypes] SET [NameEn] = N''Men''''s Box''
    WHERE [Id] = ''a1b2c3d4-e5f6-7890-abcd-ef1234567890'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [BoxTypes] SET [NameEn] = N''Women''''s Box''
    WHERE [Id] = ''b2c3d4e5-f6a7-8901-bcde-f12345678901'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [BoxTypes] SET [NameEn] = N''Couple''''s Box''
    WHERE [Id] = ''c3d4e5f6-a7b8-9012-cdef-123456789012'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''Cairo''
    WHERE [Id] = ''a0000000-0000-0000-0000-000000000001'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''Giza''
    WHERE [Id] = ''a0000000-0000-0000-0000-000000000002'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''Alexandria''
    WHERE [Id] = ''a0000000-0000-0000-0000-000000000003'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''Dakahlia''
    WHERE [Id] = ''a0000000-0000-0000-0000-000000000004'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''Beheira''
    WHERE [Id] = ''a0000000-0000-0000-0000-000000000005'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''Minya''
    WHERE [Id] = ''a0000000-0000-0000-0000-000000000006'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''Qalyubia''
    WHERE [Id] = ''a0000000-0000-0000-0000-000000000007'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''Sharqia''
    WHERE [Id] = ''a0000000-0000-0000-0000-000000000008'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''Gharbia''
    WHERE [Id] = ''a0000000-0000-0000-0000-000000000009'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''Monufia''
    WHERE [Id] = ''a0000000-0000-0000-0000-00000000000a'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''Kafr El Sheikh''
    WHERE [Id] = ''a0000000-0000-0000-0000-00000000000b'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''Fayoum''
    WHERE [Id] = ''a0000000-0000-0000-0000-00000000000c'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''Beni Suef''
    WHERE [Id] = ''a0000000-0000-0000-0000-00000000000d'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''Assiut''
    WHERE [Id] = ''a0000000-0000-0000-0000-00000000000e'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''Sohag''
    WHERE [Id] = ''a0000000-0000-0000-0000-00000000000f'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''Qena''
    WHERE [Id] = ''a0000000-0000-0000-0000-000000000010'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''Luxor''
    WHERE [Id] = ''a0000000-0000-0000-0000-000000000011'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''Aswan''
    WHERE [Id] = ''a0000000-0000-0000-0000-000000000012'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''Damietta''
    WHERE [Id] = ''a0000000-0000-0000-0000-000000000013'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''Port Said''
    WHERE [Id] = ''a0000000-0000-0000-0000-000000000014'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''Ismailia''
    WHERE [Id] = ''a0000000-0000-0000-0000-000000000015'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''Suez''
    WHERE [Id] = ''a0000000-0000-0000-0000-000000000016'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''North Sinai''
    WHERE [Id] = ''a0000000-0000-0000-0000-000000000017'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''South Sinai''
    WHERE [Id] = ''a0000000-0000-0000-0000-000000000018'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''Matrouh''
    WHERE [Id] = ''a0000000-0000-0000-0000-000000000019'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''New Valley''
    WHERE [Id] = ''a0000000-0000-0000-0000-00000000001a'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Governorates] SET [NameEn] = N''Red Sea''
    WHERE [Id] = ''a0000000-0000-0000-0000-00000000001b'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [NameEn] = N''Classic Gold Men''''s Watch''
    WHERE [Id] = ''aaaa0001-0001-0001-0001-000000000001'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [NameEn] = N''Black Steel Men''''s Watch''
    WHERE [Id] = ''aaaa0001-0001-0001-0001-000000000002'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [NameEn] = N''Silver Sport Men''''s Watch''
    WHERE [Id] = ''aaaa0001-0001-0001-0001-000000000003'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [NameEn] = N''Rose Gold Women''''s Watch''
    WHERE [Id] = ''aaaa0001-0001-0001-0001-000000000004'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [NameEn] = N''Minimal Women''''s Watch''
    WHERE [Id] = ''aaaa0001-0001-0001-0001-000000000005'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [NameEn] = N''Pearl Women''''s Watch''
    WHERE [Id] = ''aaaa0001-0001-0001-0001-000000000006'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [NameEn] = N''Brown Leather Men''''s Wallet''
    WHERE [Id] = ''aaaa0002-0002-0002-0002-000000000001'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [NameEn] = N''Black Slim Men''''s Wallet''
    WHERE [Id] = ''aaaa0002-0002-0002-0002-000000000002'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [NameEn] = N''Classic Men''''s Wallet''
    WHERE [Id] = ''aaaa0002-0002-0002-0002-000000000003'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [NameEn] = N''Pink Women''''s Wallet''
    WHERE [Id] = ''aaaa0002-0002-0002-0002-000000000004'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [NameEn] = N''Beige Women''''s Wallet''
    WHERE [Id] = ''aaaa0002-0002-0002-0002-000000000005'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [NameEn] = N''Gold Women''''s Wallet''
    WHERE [Id] = ''aaaa0002-0002-0002-0002-000000000006'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [NameEn] = N''Black Men''''s Mug''
    WHERE [Id] = ''aaaa0003-0003-0003-0003-000000000001'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [NameEn] = N''Grey Men''''s Mug''
    WHERE [Id] = ''aaaa0003-0003-0003-0003-000000000002'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [NameEn] = N''Navy Men''''s Mug''
    WHERE [Id] = ''aaaa0003-0003-0003-0003-000000000003'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [NameEn] = N''Pink Women''''s Mug''
    WHERE [Id] = ''aaaa0003-0003-0003-0003-000000000004'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [NameEn] = N''Marble Women''''s Mug''
    WHERE [Id] = ''aaaa0003-0003-0003-0003-000000000005'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [NameEn] = N''Floral Women''''s Mug''
    WHERE [Id] = ''aaaa0003-0003-0003-0003-000000000006'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [NameEn] = N''Silver Men''''s Chain''
    WHERE [Id] = ''aaaa0004-0004-0004-0004-000000000001'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [NameEn] = N''Steel Men''''s Chain''
    WHERE [Id] = ''aaaa0004-0004-0004-0004-000000000002'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [NameEn] = N''Minimal Men''''s Chain''
    WHERE [Id] = ''aaaa0004-0004-0004-0004-000000000003'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [NameEn] = N''Heart Women''''s Necklace''
    WHERE [Id] = ''aaaa0004-0004-0004-0004-000000000004'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [NameEn] = N''Pearl Women''''s Necklace''
    WHERE [Id] = ''aaaa0004-0004-0004-0004-000000000005'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [NameEn] = N''Gold Women''''s Pendant''
    WHERE [Id] = ''aaaa0004-0004-0004-0004-000000000006'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [NameEn] = N''Titanium Men''''s Ring''
    WHERE [Id] = ''aaaa0005-0005-0005-0005-000000000001'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [NameEn] = N''Silver Men''''s Ring''
    WHERE [Id] = ''aaaa0005-0005-0005-0005-000000000002'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [NameEn] = N''Black Men''''s Ring''
    WHERE [Id] = ''aaaa0005-0005-0005-0005-000000000003'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [NameEn] = N''Diamond Women''''s Ring''
    WHERE [Id] = ''aaaa0005-0005-0005-0005-000000000004'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [NameEn] = N''Gold Women''''s Ring''
    WHERE [Id] = ''aaaa0005-0005-0005-0005-000000000005'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [NameEn] = N''Silver Women''''s Ring''
    WHERE [Id] = ''aaaa0005-0005-0005-0005-000000000006'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314000718_SeedDataNameEn_EnumTypeSafety'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260314000718_SeedDataNameEn_EnumTypeSafety', N'8.0.10');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314023127_SeedProductDescriptionEn'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N''Elegant men''''s gold watch with a classic design''
    WHERE [Id] = ''aaaa0001-0001-0001-0001-000000000001'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314023127_SeedProductDescriptionEn'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N''Men''''s watch with a black stainless steel frame''
    WHERE [Id] = ''aaaa0001-0001-0001-0001-000000000002'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314023127_SeedProductDescriptionEn'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N''Silver-toned sporty men''''s watch''
    WHERE [Id] = ''aaaa0001-0001-0001-0001-000000000003'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314023127_SeedProductDescriptionEn'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N''Refined women''''s watch in rose gold''
    WHERE [Id] = ''aaaa0001-0001-0001-0001-000000000004'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314023127_SeedProductDescriptionEn'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N''Women''''s watch with a sleek minimal design''
    WHERE [Id] = ''aaaa0001-0001-0001-0001-000000000005'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314023127_SeedProductDescriptionEn'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N''Luxurious women''''s watch with a pearl bracelet''
    WHERE [Id] = ''aaaa0001-0001-0001-0001-000000000006'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314023127_SeedProductDescriptionEn'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N''Men''''s wallet made of genuine brown leather''
    WHERE [Id] = ''aaaa0002-0002-0002-0002-000000000001'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314023127_SeedProductDescriptionEn'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N''Slim men''''s wallet in elegant black''
    WHERE [Id] = ''aaaa0002-0002-0002-0002-000000000002'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314023127_SeedProductDescriptionEn'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N''Classic men''''s wallet with multiple compartments''
    WHERE [Id] = ''aaaa0002-0002-0002-0002-000000000003'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314023127_SeedProductDescriptionEn'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N''Women''''s wallet in an attractive pink color''
    WHERE [Id] = ''aaaa0002-0002-0002-0002-000000000004'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314023127_SeedProductDescriptionEn'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N''Women''''s wallet in classic beige''
    WHERE [Id] = ''aaaa0002-0002-0002-0002-000000000005'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314023127_SeedProductDescriptionEn'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N''Women''''s wallet with an elegant gold accent''
    WHERE [Id] = ''aaaa0002-0002-0002-0002-000000000006'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314023127_SeedProductDescriptionEn'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N''Black mug with a distinctive men''''s design''
    WHERE [Id] = ''aaaa0003-0003-0003-0003-000000000001'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314023127_SeedProductDescriptionEn'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N''Grey mug with a modern touch''
    WHERE [Id] = ''aaaa0003-0003-0003-0003-000000000002'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314023127_SeedProductDescriptionEn'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N''Elegant navy-colored mug''
    WHERE [Id] = ''aaaa0003-0003-0003-0003-000000000003'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314023127_SeedProductDescriptionEn'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N''Pink mug with a soft design''
    WHERE [Id] = ''aaaa0003-0003-0003-0003-000000000004'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314023127_SeedProductDescriptionEn'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N''Mug with a luxurious marble design''
    WHERE [Id] = ''aaaa0003-0003-0003-0003-000000000005'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314023127_SeedProductDescriptionEn'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N''Mug with a delicate floral pattern''
    WHERE [Id] = ''aaaa0003-0003-0003-0003-000000000006'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314023127_SeedProductDescriptionEn'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N''Men''''s chain made of pure silver''
    WHERE [Id] = ''aaaa0004-0004-0004-0004-000000000001'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314023127_SeedProductDescriptionEn'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N''Men''''s stainless steel chain''
    WHERE [Id] = ''aaaa0004-0004-0004-0004-000000000002'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314023127_SeedProductDescriptionEn'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N''Men''''s chain with a minimal design''
    WHERE [Id] = ''aaaa0004-0004-0004-0004-000000000003'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314023127_SeedProductDescriptionEn'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N''Women''''s necklace with a dainty heart pendant''
    WHERE [Id] = ''aaaa0004-0004-0004-0004-000000000004'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314023127_SeedProductDescriptionEn'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N''Women''''s necklace with natural pearls''
    WHERE [Id] = ''aaaa0004-0004-0004-0004-000000000005'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314023127_SeedProductDescriptionEn'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N''Women''''s necklace with an elegant gold pendant''
    WHERE [Id] = ''aaaa0004-0004-0004-0004-000000000006'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314023127_SeedProductDescriptionEn'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N''Durable men''''s titanium ring''
    WHERE [Id] = ''aaaa0005-0005-0005-0005-000000000001'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314023127_SeedProductDescriptionEn'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N''Classic silver men''''s ring''
    WHERE [Id] = ''aaaa0005-0005-0005-0005-000000000002'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314023127_SeedProductDescriptionEn'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N''Elegant black men''''s ring''
    WHERE [Id] = ''aaaa0005-0005-0005-0005-000000000003'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314023127_SeedProductDescriptionEn'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N''Women''''s ring studded with diamonds''
    WHERE [Id] = ''aaaa0005-0005-0005-0005-000000000004'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314023127_SeedProductDescriptionEn'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N''Delicate gold women''''s ring''
    WHERE [Id] = ''aaaa0005-0005-0005-0005-000000000005'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314023127_SeedProductDescriptionEn'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [DescriptionEn] = N''Silver women''''s ring with a unique design''
    WHERE [Id] = ''aaaa0005-0005-0005-0005-000000000006'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314023127_SeedProductDescriptionEn'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260314023127_SeedProductDescriptionEn', N'8.0.10');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314031326_AddCityDistrictToAddress'
)
BEGIN
    ALTER TABLE [Addresses] ADD [City] nvarchar(100) NOT NULL DEFAULT N'';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314031326_AddCityDistrictToAddress'
)
BEGIN
    ALTER TABLE [Addresses] ADD [District] nvarchar(100) NOT NULL DEFAULT N'';
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314031326_AddCityDistrictToAddress'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260314031326_AddCityDistrictToAddress', N'8.0.10');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314035631_AddCartTable'
)
BEGIN
    CREATE TABLE [Carts] (
        [Id] uniqueidentifier NOT NULL DEFAULT (NEWID()),
        [UserId] uniqueidentifier NOT NULL,
        [ItemsJson] nvarchar(max) NOT NULL,
        [UpdatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        CONSTRAINT [PK_Carts] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Carts_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314035631_AddCartTable'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Carts_UserId] ON [Carts] ([UserId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314035631_AddCartTable'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260314035631_AddCartTable', N'8.0.10');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314125135_AddWishlistPromotionCouponBoxReviewStock'
)
BEGIN
    ALTER TABLE [Products] ADD [StockQuantity] int NOT NULL DEFAULT 0;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314125135_AddWishlistPromotionCouponBoxReviewStock'
)
BEGIN
    ALTER TABLE [Orders] ADD [CouponCode] nvarchar(50) NULL;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314125135_AddWishlistPromotionCouponBoxReviewStock'
)
BEGIN
    ALTER TABLE [Orders] ADD [DiscountAmount] decimal(10,2) NOT NULL DEFAULT 0.0;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314125135_AddWishlistPromotionCouponBoxReviewStock'
)
BEGIN
    CREATE TABLE [BoxReviews] (
        [Id] uniqueidentifier NOT NULL DEFAULT (NEWID()),
        [UserId] uniqueidentifier NOT NULL,
        [BoxTypeId] uniqueidentifier NOT NULL,
        [OrderId] uniqueidentifier NOT NULL,
        [Rating] int NOT NULL,
        [Comment] nvarchar(1000) NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        CONSTRAINT [PK_BoxReviews] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_BoxReviews_BoxTypes_BoxTypeId] FOREIGN KEY ([BoxTypeId]) REFERENCES [BoxTypes] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_BoxReviews_Orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [Orders] ([Id]),
        CONSTRAINT [FK_BoxReviews_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314125135_AddWishlistPromotionCouponBoxReviewStock'
)
BEGIN
    CREATE TABLE [Coupons] (
        [Id] uniqueidentifier NOT NULL DEFAULT (NEWID()),
        [Code] nvarchar(50) NOT NULL,
        [DiscountType] nvarchar(20) NOT NULL,
        [Value] decimal(10,2) NOT NULL,
        [MaxUses] int NOT NULL,
        [UsedCount] int NOT NULL,
        [ExpirationDate] datetime2 NOT NULL,
        [IsActive] bit NOT NULL DEFAULT CAST(1 AS bit),
        [MinOrderAmount] decimal(10,2) NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        CONSTRAINT [PK_Coupons] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314125135_AddWishlistPromotionCouponBoxReviewStock'
)
BEGIN
    CREATE TABLE [Promotions] (
        [Id] uniqueidentifier NOT NULL DEFAULT (NEWID()),
        [Name] nvarchar(200) NOT NULL,
        [NameEn] nvarchar(200) NOT NULL,
        [DiscountType] nvarchar(20) NOT NULL,
        [Value] decimal(10,2) NOT NULL,
        [StartDate] datetime2 NOT NULL,
        [EndDate] datetime2 NOT NULL,
        [IsActive] bit NOT NULL DEFAULT CAST(1 AS bit),
        [ProductId] uniqueidentifier NULL,
        [Category] nvarchar(50) NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        CONSTRAINT [PK_Promotions] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Promotions_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314125135_AddWishlistPromotionCouponBoxReviewStock'
)
BEGIN
    CREATE TABLE [Wishlists] (
        [Id] uniqueidentifier NOT NULL DEFAULT (NEWID()),
        [UserId] uniqueidentifier NOT NULL,
        [ProductId] uniqueidentifier NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        CONSTRAINT [PK_Wishlists] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Wishlists_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_Wishlists_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314125135_AddWishlistPromotionCouponBoxReviewStock'
)
BEGIN
    CREATE INDEX [IX_Products_StockQuantity] ON [Products] ([StockQuantity]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314125135_AddWishlistPromotionCouponBoxReviewStock'
)
BEGIN
    CREATE INDEX [IX_BoxReviews_BoxTypeId] ON [BoxReviews] ([BoxTypeId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314125135_AddWishlistPromotionCouponBoxReviewStock'
)
BEGIN
    CREATE INDEX [IX_BoxReviews_OrderId] ON [BoxReviews] ([OrderId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314125135_AddWishlistPromotionCouponBoxReviewStock'
)
BEGIN
    CREATE INDEX [IX_BoxReviews_UserId] ON [BoxReviews] ([UserId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314125135_AddWishlistPromotionCouponBoxReviewStock'
)
BEGIN
    CREATE UNIQUE INDEX [IX_BoxReviews_UserId_OrderId_BoxTypeId] ON [BoxReviews] ([UserId], [OrderId], [BoxTypeId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314125135_AddWishlistPromotionCouponBoxReviewStock'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Coupons_Code] ON [Coupons] ([Code]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314125135_AddWishlistPromotionCouponBoxReviewStock'
)
BEGIN
    CREATE INDEX [IX_Coupons_ExpirationDate] ON [Coupons] ([ExpirationDate]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314125135_AddWishlistPromotionCouponBoxReviewStock'
)
BEGIN
    CREATE INDEX [IX_Coupons_IsActive] ON [Coupons] ([IsActive]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314125135_AddWishlistPromotionCouponBoxReviewStock'
)
BEGIN
    CREATE INDEX [IX_Promotions_Category] ON [Promotions] ([Category]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314125135_AddWishlistPromotionCouponBoxReviewStock'
)
BEGIN
    CREATE INDEX [IX_Promotions_EndDate] ON [Promotions] ([EndDate]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314125135_AddWishlistPromotionCouponBoxReviewStock'
)
BEGIN
    CREATE INDEX [IX_Promotions_IsActive] ON [Promotions] ([IsActive]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314125135_AddWishlistPromotionCouponBoxReviewStock'
)
BEGIN
    CREATE INDEX [IX_Promotions_ProductId] ON [Promotions] ([ProductId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314125135_AddWishlistPromotionCouponBoxReviewStock'
)
BEGIN
    CREATE INDEX [IX_Promotions_StartDate] ON [Promotions] ([StartDate]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314125135_AddWishlistPromotionCouponBoxReviewStock'
)
BEGIN
    CREATE INDEX [IX_Wishlists_ProductId] ON [Wishlists] ([ProductId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314125135_AddWishlistPromotionCouponBoxReviewStock'
)
BEGIN
    CREATE INDEX [IX_Wishlists_UserId] ON [Wishlists] ([UserId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314125135_AddWishlistPromotionCouponBoxReviewStock'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Wishlists_UserId_ProductId] ON [Wishlists] ([UserId], [ProductId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314125135_AddWishlistPromotionCouponBoxReviewStock'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260314125135_AddWishlistPromotionCouponBoxReviewStock', N'8.0.10');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314131428_SeedPromotionsAndCoupons'
)
BEGIN
    DROP INDEX [IX_Wishlists_UserId] ON [Wishlists];
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314131428_SeedPromotionsAndCoupons'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Code', N'CreatedAt', N'DiscountType', N'ExpirationDate', N'IsActive', N'MaxUses', N'MinOrderAmount', N'UsedCount', N'Value') AND [object_id] = OBJECT_ID(N'[Coupons]'))
        SET IDENTITY_INSERT [Coupons] ON;
    EXEC(N'INSERT INTO [Coupons] ([Id], [Code], [CreatedAt], [DiscountType], [ExpirationDate], [IsActive], [MaxUses], [MinOrderAmount], [UsedCount], [Value])
    VALUES (''cc000001-0000-0000-0000-000000000001'', N''WELCOME10'', ''2025-01-01T00:00:00.0000000Z'', N''percentage'', ''2026-12-31T23:59:59.0000000Z'', CAST(1 AS bit), 100, NULL, 0, 10.0),
    (''cc000001-0000-0000-0000-000000000002'', N''SAVE50'', ''2025-01-01T00:00:00.0000000Z'', N''fixed'', ''2026-12-31T23:59:59.0000000Z'', CAST(1 AS bit), 50, 300.0, 0, 50.0),
    (''cc000001-0000-0000-0000-000000000003'', N''VIP20'', ''2025-01-01T00:00:00.0000000Z'', N''percentage'', ''2026-06-30T23:59:59.0000000Z'', CAST(1 AS bit), 10, 500.0, 7, 20.0)');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Code', N'CreatedAt', N'DiscountType', N'ExpirationDate', N'IsActive', N'MaxUses', N'MinOrderAmount', N'UsedCount', N'Value') AND [object_id] = OBJECT_ID(N'[Coupons]'))
        SET IDENTITY_INSERT [Coupons] OFF;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314131428_SeedPromotionsAndCoupons'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Code', N'CreatedAt', N'DiscountType', N'ExpirationDate', N'MaxUses', N'MinOrderAmount', N'UsedCount', N'Value') AND [object_id] = OBJECT_ID(N'[Coupons]'))
        SET IDENTITY_INSERT [Coupons] ON;
    EXEC(N'INSERT INTO [Coupons] ([Id], [Code], [CreatedAt], [DiscountType], [ExpirationDate], [MaxUses], [MinOrderAmount], [UsedCount], [Value])
    VALUES (''cc000001-0000-0000-0000-000000000004'', N''EXPIRED25'', ''2025-01-01T00:00:00.0000000Z'', N''percentage'', ''2024-12-31T23:59:59.0000000Z'', 50, NULL, 50, 25.0)');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Code', N'CreatedAt', N'DiscountType', N'ExpirationDate', N'MaxUses', N'MinOrderAmount', N'UsedCount', N'Value') AND [object_id] = OBJECT_ID(N'[Coupons]'))
        SET IDENTITY_INSERT [Coupons] OFF;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314131428_SeedPromotionsAndCoupons'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [StockQuantity] = 25
    WHERE [Id] = ''aaaa0001-0001-0001-0001-000000000001'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314131428_SeedPromotionsAndCoupons'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [StockQuantity] = 25
    WHERE [Id] = ''aaaa0001-0001-0001-0001-000000000002'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314131428_SeedPromotionsAndCoupons'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [StockQuantity] = 25
    WHERE [Id] = ''aaaa0001-0001-0001-0001-000000000003'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314131428_SeedPromotionsAndCoupons'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [StockQuantity] = 25
    WHERE [Id] = ''aaaa0001-0001-0001-0001-000000000004'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314131428_SeedPromotionsAndCoupons'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [StockQuantity] = 25
    WHERE [Id] = ''aaaa0001-0001-0001-0001-000000000005'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314131428_SeedPromotionsAndCoupons'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [StockQuantity] = 25
    WHERE [Id] = ''aaaa0002-0002-0002-0002-000000000001'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314131428_SeedPromotionsAndCoupons'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [StockQuantity] = 25
    WHERE [Id] = ''aaaa0002-0002-0002-0002-000000000002'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314131428_SeedPromotionsAndCoupons'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [StockQuantity] = 25
    WHERE [Id] = ''aaaa0002-0002-0002-0002-000000000004'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314131428_SeedPromotionsAndCoupons'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [StockQuantity] = 25
    WHERE [Id] = ''aaaa0002-0002-0002-0002-000000000005'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314131428_SeedPromotionsAndCoupons'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [StockQuantity] = 25
    WHERE [Id] = ''aaaa0002-0002-0002-0002-000000000006'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314131428_SeedPromotionsAndCoupons'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [StockQuantity] = 25
    WHERE [Id] = ''aaaa0003-0003-0003-0003-000000000001'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314131428_SeedPromotionsAndCoupons'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [StockQuantity] = 25
    WHERE [Id] = ''aaaa0003-0003-0003-0003-000000000002'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314131428_SeedPromotionsAndCoupons'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [StockQuantity] = 25
    WHERE [Id] = ''aaaa0003-0003-0003-0003-000000000003'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314131428_SeedPromotionsAndCoupons'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [StockQuantity] = 25
    WHERE [Id] = ''aaaa0003-0003-0003-0003-000000000004'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314131428_SeedPromotionsAndCoupons'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [StockQuantity] = 25
    WHERE [Id] = ''aaaa0003-0003-0003-0003-000000000005'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314131428_SeedPromotionsAndCoupons'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [StockQuantity] = 25
    WHERE [Id] = ''aaaa0004-0004-0004-0004-000000000001'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314131428_SeedPromotionsAndCoupons'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [StockQuantity] = 25
    WHERE [Id] = ''aaaa0004-0004-0004-0004-000000000003'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314131428_SeedPromotionsAndCoupons'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [StockQuantity] = 25
    WHERE [Id] = ''aaaa0004-0004-0004-0004-000000000004'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314131428_SeedPromotionsAndCoupons'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [StockQuantity] = 25
    WHERE [Id] = ''aaaa0004-0004-0004-0004-000000000005'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314131428_SeedPromotionsAndCoupons'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [StockQuantity] = 25
    WHERE [Id] = ''aaaa0004-0004-0004-0004-000000000006'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314131428_SeedPromotionsAndCoupons'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [StockQuantity] = 25
    WHERE [Id] = ''aaaa0005-0005-0005-0005-000000000001'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314131428_SeedPromotionsAndCoupons'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [StockQuantity] = 25
    WHERE [Id] = ''aaaa0005-0005-0005-0005-000000000003'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314131428_SeedPromotionsAndCoupons'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [StockQuantity] = 25
    WHERE [Id] = ''aaaa0005-0005-0005-0005-000000000004'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314131428_SeedPromotionsAndCoupons'
)
BEGIN
    EXEC(N'UPDATE [Products] SET [StockQuantity] = 25
    WHERE [Id] = ''aaaa0005-0005-0005-0005-000000000005'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314131428_SeedPromotionsAndCoupons'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Category', N'CreatedAt', N'DiscountType', N'EndDate', N'IsActive', N'Name', N'NameEn', N'ProductId', N'StartDate', N'Value') AND [object_id] = OBJECT_ID(N'[Promotions]'))
        SET IDENTITY_INSERT [Promotions] ON;
    EXEC(N'INSERT INTO [Promotions] ([Id], [Category], [CreatedAt], [DiscountType], [EndDate], [IsActive], [Name], [NameEn], [ProductId], [StartDate], [Value])
    VALUES (''bb000001-0000-0000-0000-000000000001'', N''watch'', ''2025-01-01T00:00:00.0000000Z'', N''percentage'', ''2026-12-31T23:59:59.0000000Z'', CAST(1 AS bit), N''خصم على الساعات'', N''Watch Sale'', NULL, ''2025-01-01T00:00:00.0000000Z'', 15.0),
    (''bb000001-0000-0000-0000-000000000002'', NULL, ''2025-01-01T00:00:00.0000000Z'', N''percentage'', ''2026-12-31T23:59:59.0000000Z'', CAST(1 AS bit), N''عرض خاص على ساعة روز جولد'', N''Rose Gold Watch Deal'', ''aaaa0001-0001-0001-0001-000000000004'', ''2025-01-01T00:00:00.0000000Z'', 20.0),
    (''bb000001-0000-0000-0000-000000000003'', N''mug'', ''2025-01-01T00:00:00.0000000Z'', N''fixed'', ''2026-12-31T23:59:59.0000000Z'', CAST(1 AS bit), N''خصم على المجات'', N''Mug Discount'', NULL, ''2025-01-01T00:00:00.0000000Z'', 30.0)');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Category', N'CreatedAt', N'DiscountType', N'EndDate', N'IsActive', N'Name', N'NameEn', N'ProductId', N'StartDate', N'Value') AND [object_id] = OBJECT_ID(N'[Promotions]'))
        SET IDENTITY_INSERT [Promotions] OFF;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314131428_SeedPromotionsAndCoupons'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Category', N'CreatedAt', N'DiscountType', N'EndDate', N'Name', N'NameEn', N'ProductId', N'StartDate', N'Value') AND [object_id] = OBJECT_ID(N'[Promotions]'))
        SET IDENTITY_INSERT [Promotions] ON;
    EXEC(N'INSERT INTO [Promotions] ([Id], [Category], [CreatedAt], [DiscountType], [EndDate], [Name], [NameEn], [ProductId], [StartDate], [Value])
    VALUES (''bb000001-0000-0000-0000-000000000004'', N''necklace'', ''2025-01-01T00:00:00.0000000Z'', N''percentage'', ''2024-09-30T23:59:59.0000000Z'', N''عرض الصيف المنتهي'', N''Expired Summer Sale'', NULL, ''2024-06-01T00:00:00.0000000Z'', 25.0)');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Category', N'CreatedAt', N'DiscountType', N'EndDate', N'Name', N'NameEn', N'ProductId', N'StartDate', N'Value') AND [object_id] = OBJECT_ID(N'[Promotions]'))
        SET IDENTITY_INSERT [Promotions] OFF;
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314131428_SeedPromotionsAndCoupons'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260314131428_SeedPromotionsAndCoupons', N'8.0.10');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260426212908_UpdateAdminCredentials'
)
BEGIN
    EXEC(N'UPDATE [Users] SET [Email] = N''admin@soulmate.com''
    WHERE [Id] = ''d4e5f6a7-b8c9-0123-defa-234567890123'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260426212908_UpdateAdminCredentials'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260426212908_UpdateAdminCredentials', N'8.0.10');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260505061052_SyncModelChanges'
)
BEGIN
    EXEC(N'UPDATE [Users] SET [PasswordHash] = N''$2a$11$DBgNiEWFnv7.aYlDIv/yLeJFnnc8o4JReQvFVVmllfbHo31VYqozq''
    WHERE [Id] = ''d4e5f6a7-b8c9-0123-defa-234567890123'';
    SELECT @@ROWCOUNT');
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260505061052_SyncModelChanges'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260505061052_SyncModelChanges', N'8.0.10');
END;
GO

COMMIT;
GO

