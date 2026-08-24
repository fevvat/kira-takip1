CREATE TABLE `appNotifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`kind` enum('geciken_kira') NOT NULL,
	`title` varchar(160) NOT NULL,
	`content` text NOT NULL,
	`dedupeKey` varchar(128) NOT NULL,
	`isRead` enum('evet','hayir') NOT NULL DEFAULT 'hayir',
	CONSTRAINT `appNotifications_id` PRIMARY KEY(`id`),
	CONSTRAINT `app_notification_dedupe_unique` UNIQUE(`userId`,`dedupeKey`)
);
--> statement-breakpoint
CREATE INDEX `app_notification_user_idx` ON `appNotifications` (`userId`,`createdAt`);