CREATE TABLE `assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`unitId` int,
	`name` varchar(160) NOT NULL,
	`category` varchar(100) NOT NULL,
	`acquisitionDate` date,
	`cost` decimal(13,2) NOT NULL DEFAULT '0',
	`status` enum('aktif','bakimda','hurda') NOT NULL DEFAULT 'aktif',
	`notes` text,
	CONSTRAINT `assets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `backupLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`label` varchar(160) NOT NULL,
	`scope` varchar(120) NOT NULL DEFAULT 'Tum veriler',
	`recordCount` int NOT NULL DEFAULT 0,
	`status` enum('hazir','arsivlendi') NOT NULL DEFAULT 'hazir',
	CONSTRAINT `backupLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `buildings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`siteId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`block` varchar(40),
	`address` text,
	`notes` text,
	CONSTRAINT `buildings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`title` varchar(180) NOT NULL,
	`category` enum('sozlesme','kimlik','tahsilat','diger') NOT NULL DEFAULT 'diger',
	`contractId` int,
	`unitId` int,
	`tenantId` int,
	`fileName` varchar(255),
	`externalUrl` varchar(2048),
	`notes` text,
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financialRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`kind` enum('gelir','gider') NOT NULL,
	`category` varchar(100) NOT NULL,
	`recordDate` date NOT NULL,
	`amount` decimal(13,2) NOT NULL,
	`unitId` int,
	`contractId` int,
	`description` text,
	CONSTRAINT `financialRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leaseContracts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`unitId` int NOT NULL,
	`tenantId` int NOT NULL,
	`startDate` date NOT NULL,
	`endDate` date NOT NULL,
	`monthlyRent` decimal(13,2) NOT NULL,
	`increasePeriodMonths` int NOT NULL DEFAULT 12,
	`securityDeposit` decimal(13,2) NOT NULL DEFAULT '0',
	`paymentDay` int NOT NULL DEFAULT 1,
	`status` enum('aktif','yaklasan','sona_erdi') NOT NULL DEFAULT 'aktif',
	`notes` text,
	CONSTRAINT `leaseContracts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rentCharges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`contractId` int NOT NULL,
	`period` varchar(7) NOT NULL,
	`dueDate` date NOT NULL,
	`amount` decimal(13,2) NOT NULL,
	`paidAmount` decimal(13,2) NOT NULL DEFAULT '0',
	`paidAt` date,
	`status` enum('bekliyor','odendi','gecikti') NOT NULL DEFAULT 'bekliyor',
	`notes` text,
	CONSTRAINT `rentCharges_id` PRIMARY KEY(`id`),
	CONSTRAINT `charges_contract_period_unique` UNIQUE(`contractId`,`period`)
);
--> statement-breakpoint
CREATE TABLE `sites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`name` varchar(160) NOT NULL,
	`address` text,
	`notes` text,
	CONSTRAINT `sites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tenants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`fullName` varchar(160) NOT NULL,
	`identityNumber` varchar(32),
	`phone` varchar(32),
	`email` varchar(320),
	`emergencyContact` varchar(160),
	`notes` text,
	CONSTRAINT `tenants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `units` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`buildingId` int NOT NULL,
	`unitNumber` varchar(32) NOT NULL,
	`floor` varchar(24),
	`unitType` varchar(80),
	`grossArea` int,
	`status` enum('bos','dolu','pasif') NOT NULL DEFAULT 'bos',
	`notes` text,
	CONSTRAINT `units_id` PRIMARY KEY(`id`),
	CONSTRAINT `units_building_number_unique` UNIQUE(`buildingId`,`unitNumber`)
);
--> statement-breakpoint
CREATE INDEX `assets_user_idx` ON `assets` (`userId`);--> statement-breakpoint
CREATE INDEX `assets_unit_idx` ON `assets` (`unitId`);--> statement-breakpoint
CREATE INDEX `backups_user_idx` ON `backupLogs` (`userId`);--> statement-breakpoint
CREATE INDEX `buildings_user_idx` ON `buildings` (`userId`);--> statement-breakpoint
CREATE INDEX `buildings_site_idx` ON `buildings` (`siteId`);--> statement-breakpoint
CREATE INDEX `documents_user_idx` ON `documents` (`userId`);--> statement-breakpoint
CREATE INDEX `finance_user_idx` ON `financialRecords` (`userId`);--> statement-breakpoint
CREATE INDEX `finance_date_idx` ON `financialRecords` (`recordDate`);--> statement-breakpoint
CREATE INDEX `contracts_user_idx` ON `leaseContracts` (`userId`);--> statement-breakpoint
CREATE INDEX `contracts_unit_idx` ON `leaseContracts` (`unitId`);--> statement-breakpoint
CREATE INDEX `contracts_tenant_idx` ON `leaseContracts` (`tenantId`);--> statement-breakpoint
CREATE INDEX `charges_user_idx` ON `rentCharges` (`userId`);--> statement-breakpoint
CREATE INDEX `charges_contract_idx` ON `rentCharges` (`contractId`);--> statement-breakpoint
CREATE INDEX `sites_user_idx` ON `sites` (`userId`);--> statement-breakpoint
CREATE INDEX `tenants_user_idx` ON `tenants` (`userId`);--> statement-breakpoint
CREATE INDEX `units_user_idx` ON `units` (`userId`);--> statement-breakpoint
CREATE INDEX `units_building_idx` ON `units` (`buildingId`);