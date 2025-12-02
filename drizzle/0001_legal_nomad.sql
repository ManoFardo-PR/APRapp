CREATE TABLE `apr_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`apr_id` int NOT NULL,
	`image_url` varchar(512) NOT NULL,
	`image_key` varchar(512) NOT NULL,
	`caption` text,
	`order` int NOT NULL,
	`uploaded_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `apr_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `apr_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`apr_id` int NOT NULL,
	`question_key` varchar(128) NOT NULL,
	`question_text` text NOT NULL,
	`answer` text NOT NULL,
	`answer_type` enum('boolean','text','multiple_choice') NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `apr_responses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aprs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`company_id` int NOT NULL,
	`created_by` int NOT NULL,
	`approved_by` int,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`location` varchar(255),
	`activity_description` text NOT NULL,
	`status` enum('draft','pending_approval','approved','rejected') NOT NULL DEFAULT 'draft',
	`ai_analysis` json,
	`approval_comments` text,
	`pdf_url` varchar(512),
	`qr_code` varchar(512),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`approved_at` timestamp,
	CONSTRAINT `aprs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`company_id` int NOT NULL,
	`user_id` int NOT NULL,
	`action` varchar(128) NOT NULL,
	`entity_type` varchar(64) NOT NULL,
	`entity_id` int,
	`details` json,
	`ip_address` varchar(45),
	`user_agent` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `companies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`max_users` int NOT NULL DEFAULT 10,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `companies_id` PRIMARY KEY(`id`),
	CONSTRAINT `companies_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `digital_signatures` (
	`id` int AUTO_INCREMENT NOT NULL,
	`apr_id` int NOT NULL,
	`user_id` int NOT NULL,
	`signature_type` enum('requester','safety_tech','supervisor') NOT NULL,
	`signature_data` text NOT NULL,
	`signed_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `digital_signatures_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `statistics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`company_id` int NOT NULL,
	`period` varchar(32) NOT NULL,
	`total_aprs` int NOT NULL DEFAULT 0,
	`approved_aprs` int NOT NULL DEFAULT 0,
	`rejected_aprs` int NOT NULL DEFAULT 0,
	`pending_aprs` int NOT NULL DEFAULT 0,
	`risk_distribution` json,
	`top_risks` json,
	`ai_corrections` int NOT NULL DEFAULT 0,
	`calculated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `statistics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('superadmin','company_admin','requester','safety_tech') NOT NULL DEFAULT 'requester';--> statement-breakpoint
ALTER TABLE `users` ADD `company_id` int;--> statement-breakpoint
ALTER TABLE `users` ADD `language` enum('pt-BR','en-US') DEFAULT 'pt-BR' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `is_active` boolean DEFAULT true NOT NULL;