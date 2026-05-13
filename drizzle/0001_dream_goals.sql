CREATE TABLE `dream_goals` (
	`id` text PRIMARY KEY NOT NULL,
	`text` text NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`completed_at` text,
	`created_at` text NOT NULL,
	`synced_at` text,
	`remote_id` text,
	`category` text
);
