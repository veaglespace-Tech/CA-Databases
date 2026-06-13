-- Drop the role column from the CEO_CaLeads.Auth table.
-- Run this once after deploying the code changes.

ALTER TABLE `CEO_CaLeads`.`Auth`
  DROP COLUMN `role`;
