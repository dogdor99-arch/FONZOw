CREATE TABLE `socialPosts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`platform` enum('shopee','lazada','facebook','tiktok','youtube','instagram','site') NOT NULL,
	`title` varchar(240) NOT NULL,
	`titleEn` varchar(240),
	`excerpt` text,
	`excerptEn` text,
	`url` varchar(1024) NOT NULL,
	`imageUrl` varchar(1024),
	`priceLabel` varchar(64),
	`postedAt` timestamp NOT NULL DEFAULT (now()),
	`pinned` boolean NOT NULL DEFAULT false,
	`published` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `socialPosts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `socialPosts_feed_idx` ON `socialPosts` (`published`,`postedAt`);--> statement-breakpoint
CREATE INDEX `socialPosts_platform_idx` ON `socialPosts` (`platform`);