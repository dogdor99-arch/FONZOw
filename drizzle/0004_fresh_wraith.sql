CREATE TABLE `worksItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`kind` enum('event','student') NOT NULL,
	`title` varchar(240) NOT NULL,
	`titleEn` varchar(240),
	`eventDate` varchar(120),
	`description` text,
	`descriptionEn` text,
	`imageUrls` json NOT NULL DEFAULT ('[]'),
	`sourceUrl` varchar(1024),
	`published` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `worksItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `worksItems_kind_idx` ON `worksItems` (`kind`,`published`,`sortOrder`);