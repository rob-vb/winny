CREATE TABLE `dream_goal` (
	`id` text PRIMARY KEY DEFAULT 'singleton' NOT NULL,
	`text` text DEFAULT '' NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `wins` (
	`id` text PRIMARY KEY NOT NULL,
	`text` text NOT NULL,
	`date_key` text NOT NULL,
	`logged_at` text NOT NULL,
	`created_at` text NOT NULL,
	`synced_at` text,
	`remote_id` text,
	`category` text
);
