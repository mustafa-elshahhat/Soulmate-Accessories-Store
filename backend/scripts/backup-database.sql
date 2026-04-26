-- ============================================================
-- Soulmate Store - Database Backup Script
-- Run via SQL Server Agent Job or scheduled task
-- ============================================================

-- Configuration
DECLARE @DatabaseName NVARCHAR(128) = N'SoulmateStore';
DECLARE @BackupPath NVARCHAR(256) = N'C:\backups\';
DECLARE @RetentionDays INT = 30;

-- Generate backup filename with timestamp
DECLARE @FileName NVARCHAR(256);
DECLARE @Timestamp NVARCHAR(20) = FORMAT(GETDATE(), 'yyyy-MM-dd_HHmmss');
SET @FileName = @BackupPath + @DatabaseName + '_' + @Timestamp + '.bak';

-- Ensure backup directory exists (SQL Server needs access)
EXEC xp_create_subdir @BackupPath;

-- Full backup with compression
BACKUP DATABASE @DatabaseName
TO DISK = @FileName
WITH
    COMPRESSION,
    INIT,
    NAME = N'SoulmateStore Full Backup',
    DESCRIPTION = N'Automated daily full backup',
    STATS = 10;

PRINT 'Backup completed: ' + @FileName;

-- Cleanup old backups (older than retention period)
DECLARE @CutoffDate DATETIME = DATEADD(DAY, -@RetentionDays, GETDATE());
DECLARE @OldFile NVARCHAR(256);

DECLARE cleanup_cursor CURSOR FOR
SELECT physical_device_name
FROM msdb.dbo.backupset bs
JOIN msdb.dbo.backupmediafamily bmf ON bs.media_set_id = bmf.media_set_id
WHERE bs.database_name = @DatabaseName
  AND bs.backup_finish_date < @CutoffDate;

OPEN cleanup_cursor;
FETCH NEXT FROM cleanup_cursor INTO @OldFile;

WHILE @@FETCH_STATUS = 0
BEGIN
    EXEC xp_delete_file 0, @OldFile;
    PRINT 'Deleted old backup: ' + @OldFile;
    FETCH NEXT FROM cleanup_cursor INTO @OldFile;
END

CLOSE cleanup_cursor;
DEALLOCATE cleanup_cursor;

PRINT 'Backup maintenance completed.';
GO
