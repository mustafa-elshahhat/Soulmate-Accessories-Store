@echo off
REM ============================================================
REM Soulmate Store - SQL Server Backup Scheduled Task Setup
REM Run as Administrator
REM ============================================================

echo Setting up daily database backup scheduled task...

REM Configuration
SET TASK_NAME=SoulmateStore_DailyBackup
SET SQL_SCRIPT=C:\path\to\soulmate-store\backend\scripts\backup-database.sql
SET SQL_SERVER=localhost\SQLEXPRESS
SET RUN_TIME=02:00

REM Create scheduled task that runs daily at 2 AM
schtasks /create ^
  /tn "%TASK_NAME%" ^
  /tr "sqlcmd -S %SQL_SERVER% -d master -i \"%SQL_SCRIPT%\" -o C:\backups\backup-log.txt" ^
  /sc daily ^
  /st %RUN_TIME% ^
  /ru SYSTEM ^
  /f

echo.
echo Scheduled task "%TASK_NAME%" created.
echo Runs daily at %RUN_TIME% using sqlcmd.
echo Backup logs: C:\backups\backup-log.txt
echo.
echo Make sure:
echo   1. C:\backups\ directory exists and SQL Server service has write access
echo   2. sqlcmd is in the system PATH
echo   3. SQL Server Agent or Windows Task Scheduler is running
pause
