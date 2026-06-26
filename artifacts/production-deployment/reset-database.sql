-- ============================================================================
-- Production Database Reset Script
-- Target: db53856 (Soulmate Store Production Database)
-- Safety: Script validates target database name before any destructive operation
-- ============================================================================

SET NOCOUNT ON;

DECLARE @TargetDB NVARCHAR(128) = 'db53856';
DECLARE @CurrentDB NVARCHAR(128) = DB_NAME();
DECLARE @sql NVARCHAR(MAX);

-- Safety check: confirm we're targeting the right database
IF @CurrentDB <> @TargetDB
BEGIN
    DECLARE @ErrMsg NVARCHAR(500) = 'SAFETY ABORT: Target database is ' + ISNULL(@CurrentDB, 'NULL') + ', expected ' + @TargetDB;
    RAISERROR(@ErrMsg, 16, 1);
    RETURN;
END

PRINT 'Target database confirmed: ' + @TargetDB;
PRINT 'Starting destructive reset at: ' + CONVERT(NVARCHAR, GETUTCDATE(), 120);

-- Drop all foreign key constraints
SET @sql = N'';
SELECT @sql = @sql + N'ALTER TABLE ' + QUOTENAME(OBJECT_SCHEMA_NAME(fk.parent_object_id)) + N'.' + QUOTENAME(OBJECT_NAME(fk.parent_object_id)) + N' DROP CONSTRAINT ' + QUOTENAME(fk.name) + N';'
FROM sys.foreign_keys AS fk;
EXEC sp_executesql @sql;
PRINT 'All foreign key constraints dropped.';

-- Drop all tables
SET @sql = N'';
SELECT @sql = @sql + N'DROP TABLE ' + QUOTENAME(SCHEMA_NAME(schema_id)) + N'.' + QUOTENAME(name) + N';'
FROM sys.tables
WHERE is_ms_shipped = 0;
EXEC sp_executesql @sql;
PRINT 'All application tables dropped.';

-- Verify reset
DECLARE @remainingTables INT;
SELECT @remainingTables = COUNT(*) FROM sys.tables WHERE is_ms_shipped = 0;

PRINT '';
PRINT 'Reset completed at: ' + CONVERT(NVARCHAR, GETUTCDATE(), 120);
PRINT 'Remaining application tables: ' + CAST(@remainingTables AS NVARCHAR(10));

IF @remainingTables > 0
BEGIN
    PRINT 'WARNING: Some tables could not be dropped.';
END
ELSE
BEGIN
    PRINT 'SUCCESS: All application tables have been removed.';
END
GO
