-- MIGRATION V5: Banner background color control
-- Run: Get-Content migrate_v5.sql | & "C:\xampp\mysql\bin\mysql.exe" -u root e-commerces

ALTER TABLE banner
  ADD COLUMN IF NOT EXISTS show_bg TINYINT(1) NOT NULL DEFAULT 1 AFTER show_banner;

SELECT 'Migration v5 complete — show_bg added to banner table' AS status;
