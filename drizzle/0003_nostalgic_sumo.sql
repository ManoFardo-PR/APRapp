ALTER TABLE `aprs` MODIFY COLUMN `status` enum('draft','pending_approval','approved','rejected','canceled') NOT NULL DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE `aprs` ADD `team_members` json;--> statement-breakpoint
ALTER TABLE `aprs` ADD `tools` json;--> statement-breakpoint
ALTER TABLE `aprs` ADD `emergency_contacts` json;