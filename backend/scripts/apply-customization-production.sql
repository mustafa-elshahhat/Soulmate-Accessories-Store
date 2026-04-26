-- =============================================
-- Apply Customization Data to Production
-- Safe to run multiple times (idempotent)
-- =============================================

BEGIN TRANSACTION;

-- 1. Upsert customization prices for all 5 categories
MERGE INTO [CategoryCustomizationPrices] AS target
USING (VALUES
    ('cc000000-0000-0000-0000-000000000001', 'watch',    50.0),
    ('cc000000-0000-0000-0000-000000000002', 'wallet',   40.0),
    ('cc000000-0000-0000-0000-000000000003', 'mug',      30.0),
    ('cc000000-0000-0000-0000-000000000004', 'necklace', 45.0),
    ('cc000000-0000-0000-0000-000000000005', 'ring',     35.0)
) AS source (Id, Category, Price)
ON target.[Category] = source.Category
WHEN MATCHED THEN
    UPDATE SET Price = source.Price
WHEN NOT MATCHED THEN
    INSERT (Id, Category, Price)
    VALUES (source.Id, source.Category, source.Price);

PRINT 'Customization prices upserted for all 5 categories.';

-- 2. Mark ~80% of ALL active products as customizable
-- First reset all to not customizable
UPDATE [Products] SET [IsCustomizable] = 0;

-- Then mark top 80% (ordered by name for determinism)
WITH RankedProducts AS (
    SELECT [Id],
           ROW_NUMBER() OVER (ORDER BY [Category], [Name]) AS RowNum,
           COUNT(*) OVER() AS Total
    FROM [Products]
    WHERE [IsActive] = 1
)
UPDATE [Products]
SET [IsCustomizable] = 1
WHERE [Id] IN (
    SELECT [Id] FROM RankedProducts
    WHERE RowNum <= CEILING(Total * 0.8)
);

DECLARE @totalProducts INT = (SELECT COUNT(*) FROM [Products] WHERE [IsActive] = 1);
DECLARE @customizable INT = (SELECT COUNT(*) FROM [Products] WHERE [IsCustomizable] = 1);
PRINT CONCAT('Updated ', @customizable, ' of ', @totalProducts, ' products to customizable (', 
    CAST(CAST(@customizable AS FLOAT) / NULLIF(@totalProducts, 0) * 100 AS INT), '%)');

-- 3. Register migration in EF history (if not already there)
IF NOT EXISTS (
    SELECT 1 FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260307092131_SeedCustomizationData'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260307092131_SeedCustomizationData', N'9.0.2');
    PRINT 'Migration history entry added.';
END
ELSE
BEGIN
    PRINT 'Migration already registered in history.';
END

COMMIT TRANSACTION;
PRINT 'Done - Customization data applied successfully!';
