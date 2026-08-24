CREATE TABLE `overdueReminderRules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`status` enum('aktif','pasif') NOT NULL DEFAULT 'aktif',
	`cronExpression` varchar(80) NOT NULL,
	`scheduleCronTaskUid` varchar(65),
	`lastRunAt` timestamp,
	`lastNotificationAt` timestamp,
	`lastOverdueCount` int NOT NULL DEFAULT 0,
	CONSTRAINT `overdueReminderRules_id` PRIMARY KEY(`id`),
	CONSTRAINT `overdue_reminder_user_unique` UNIQUE(`userId`),
	CONSTRAINT `overdue_reminder_task_unique` UNIQUE(`scheduleCronTaskUid`)
);
--> statement-breakpoint
ALTER TABLE `units` ADD `netArea` int;--> statement-breakpoint
ALTER TABLE `units` ADD `roomCount` varchar(24);--> statement-breakpoint
ALTER TABLE `units` ADD `targetRent` decimal(13,2);--> statement-breakpoint
ALTER TABLE `units` ADD `monthlyDues` decimal(13,2);--> statement-breakpoint
ALTER TABLE `units` ADD `furnished` enum('evet','hayir') DEFAULT 'hayir' NOT NULL;--> statement-breakpoint
ALTER TABLE `units` ADD `parkingSlot` varchar(40);--> statement-breakpoint
ALTER TABLE `units` ADD `electricityMeterNo` varchar(64);--> statement-breakpoint
ALTER TABLE `units` ADD `waterMeterNo` varchar(64);--> statement-breakpoint
ALTER TABLE `units` ADD `naturalGasMeterNo` varchar(64);--> statement-breakpoint
CREATE INDEX `overdue_reminder_task_idx` ON `overdueReminderRules` (`scheduleCronTaskUid`);