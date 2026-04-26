BEGIN TRANSACTION;
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Category', N'Price') AND [object_id] = OBJECT_ID(N'[CategoryCustomizationPrices]'))
    SET IDENTITY_INSERT [CategoryCustomizationPrices] ON;
INSERT INTO [CategoryCustomizationPrices] ([Id], [Category], [Price])
VALUES ('cc000000-0000-0000-0000-000000000001', N'watch', 50.0),
('cc000000-0000-0000-0000-000000000002', N'wallet', 40.0),
('cc000000-0000-0000-0000-000000000003', N'mug', 30.0),
('cc000000-0000-0000-0000-000000000004', N'necklace', 45.0),
('cc000000-0000-0000-0000-000000000005', N'ring', 35.0);
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Category', N'Price') AND [object_id] = OBJECT_ID(N'[CategoryCustomizationPrices]'))
    SET IDENTITY_INSERT [CategoryCustomizationPrices] OFF;

UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
WHERE [Id] = 'aaaa0001-0001-0001-0001-000000000001';
SELECT @@ROWCOUNT;


UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
WHERE [Id] = 'aaaa0001-0001-0001-0001-000000000002';
SELECT @@ROWCOUNT;


UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
WHERE [Id] = 'aaaa0001-0001-0001-0001-000000000004';
SELECT @@ROWCOUNT;


UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
WHERE [Id] = 'aaaa0001-0001-0001-0001-000000000005';
SELECT @@ROWCOUNT;


UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
WHERE [Id] = 'aaaa0001-0001-0001-0001-000000000006';
SELECT @@ROWCOUNT;


UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
WHERE [Id] = 'aaaa0002-0002-0002-0002-000000000001';
SELECT @@ROWCOUNT;


UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
WHERE [Id] = 'aaaa0002-0002-0002-0002-000000000002';
SELECT @@ROWCOUNT;


UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
WHERE [Id] = 'aaaa0002-0002-0002-0002-000000000004';
SELECT @@ROWCOUNT;


UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
WHERE [Id] = 'aaaa0002-0002-0002-0002-000000000005';
SELECT @@ROWCOUNT;


UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
WHERE [Id] = 'aaaa0002-0002-0002-0002-000000000006';
SELECT @@ROWCOUNT;


UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
WHERE [Id] = 'aaaa0003-0003-0003-0003-000000000001';
SELECT @@ROWCOUNT;


UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
WHERE [Id] = 'aaaa0003-0003-0003-0003-000000000002';
SELECT @@ROWCOUNT;


UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
WHERE [Id] = 'aaaa0003-0003-0003-0003-000000000003';
SELECT @@ROWCOUNT;


UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
WHERE [Id] = 'aaaa0003-0003-0003-0003-000000000004';
SELECT @@ROWCOUNT;


UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
WHERE [Id] = 'aaaa0003-0003-0003-0003-000000000005';
SELECT @@ROWCOUNT;


UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
WHERE [Id] = 'aaaa0004-0004-0004-0004-000000000001';
SELECT @@ROWCOUNT;


UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
WHERE [Id] = 'aaaa0004-0004-0004-0004-000000000003';
SELECT @@ROWCOUNT;


UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
WHERE [Id] = 'aaaa0004-0004-0004-0004-000000000004';
SELECT @@ROWCOUNT;


UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
WHERE [Id] = 'aaaa0004-0004-0004-0004-000000000005';
SELECT @@ROWCOUNT;


UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
WHERE [Id] = 'aaaa0004-0004-0004-0004-000000000006';
SELECT @@ROWCOUNT;


UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
WHERE [Id] = 'aaaa0005-0005-0005-0005-000000000001';
SELECT @@ROWCOUNT;


UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
WHERE [Id] = 'aaaa0005-0005-0005-0005-000000000003';
SELECT @@ROWCOUNT;


UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
WHERE [Id] = 'aaaa0005-0005-0005-0005-000000000004';
SELECT @@ROWCOUNT;


UPDATE [Products] SET [IsCustomizable] = CAST(1 AS bit)
WHERE [Id] = 'aaaa0005-0005-0005-0005-000000000005';
SELECT @@ROWCOUNT;


INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260307092131_SeedCustomizationData', N'9.0.6');

COMMIT;
GO

