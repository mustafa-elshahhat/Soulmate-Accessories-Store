-- ============================================================
-- Soulmate Store - Database Restore Script
-- Use this to restore from a backup file
-- ============================================================
-- WARNING: This will OVERWRITE the existing database!

-- 1. Set the backup file path
DECLARE @BackupFile NVARCHAR(256) = N'D:\Backups\SoulmateStore_YYYY-MM-DD_HHmmss.bak';
DECLARE @DatabaseName NVARCHAR(128) = N'SoulmateStore';

-- 2. Verify the backup file contents
RESTORE HEADERONLY FROM DISK = @BackupFile;
RESTORE FILELISTONLY FROM DISK = @BackupFile;

-- 3. Set database to single-user mode to disconnect all users
ALTER DATABASE [SoulmateStore] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;

-- 4. Restore the database
RESTORE DATABASE @DatabaseName
FROM DISK = @BackupFile
WITH
    REPLACE,
    STATS = 10;

-- 5. Set database back to multi-user mode
ALTER DATABASE [SoulmateStore] SET MULTI_USER;

PRINT 'Database restore completed successfully.';
GO
