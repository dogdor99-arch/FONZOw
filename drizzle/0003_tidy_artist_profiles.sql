CREATE TABLE `artistProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(180) NOT NULL,
	`nameEn` varchar(180),
	`role` varchar(240),
	`roleEn` varchar(240),
	`bio` text,
	`bioEn` text,
	`imageUrl` varchar(1024),
	`collaborationImageUrl` varchar(1024),
	`sourceUrl` varchar(1024),
	`guitar` varchar(240),
	`published` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `artistProfiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `artistProfiles_published_idx` ON `artistProfiles` (`published`,`sortOrder`);