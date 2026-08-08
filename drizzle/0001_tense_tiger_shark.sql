CREATE TABLE `enquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(40),
	`subject` varchar(240),
	`message` text NOT NULL,
	`productCode` varchar(32),
	`status` enum('new','in_progress','closed') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `enquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `listingFavorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`listingId` int NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `listingFavorites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `listingMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`listingId` int NOT NULL,
	`senderId` int NOT NULL,
	`recipientId` int NOT NULL,
	`body` text NOT NULL,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `listingMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `listings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sellerId` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text NOT NULL,
	`intent` enum('sell','trade','both') NOT NULL DEFAULT 'sell',
	`condition` enum('new','mint','excellent','good','fair') NOT NULL DEFAULT 'excellent',
	`brand` varchar(120),
	`model` varchar(160),
	`year` int,
	`price` decimal(12,2),
	`currencyCode` varchar(8) NOT NULL DEFAULT 'THB',
	`location` varchar(160),
	`contactLine` varchar(160),
	`contactPhone` varchar(40),
	`imagesJson` text,
	`status` enum('active','reserved','sold','hidden') NOT NULL DEFAULT 'active',
	`viewCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `listings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`status` varchar(40) NOT NULL,
	`description` varchar(400),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orderEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderNumber` varchar(40) NOT NULL,
	`email` varchar(320) NOT NULL,
	`userId` int,
	`cartId` varchar(255),
	`totalAmount` decimal(12,2),
	`currencyCode` varchar(8) NOT NULL DEFAULT 'THB',
	`status` enum('pending','paid','in_production','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
	`trackingNumber` varchar(120),
	`carrier` varchar(80),
	`note` text,
	`itemsJson` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wishlist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productCode` varchar(32) NOT NULL,
	`productKind` enum('guitar','accessory') NOT NULL DEFAULT 'guitar',
	`notify` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wishlist_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `listingFavorites_userId_idx` ON `listingFavorites` (`userId`);--> statement-breakpoint
CREATE INDEX `listingMessages_listingId_idx` ON `listingMessages` (`listingId`);--> statement-breakpoint
CREATE INDEX `listingMessages_recipientId_idx` ON `listingMessages` (`recipientId`);--> statement-breakpoint
CREATE INDEX `listings_sellerId_idx` ON `listings` (`sellerId`);--> statement-breakpoint
CREATE INDEX `listings_status_idx` ON `listings` (`status`);--> statement-breakpoint
CREATE INDEX `orderEvents_orderId_idx` ON `orderEvents` (`orderId`);--> statement-breakpoint
CREATE INDEX `orders_orderNumber_idx` ON `orders` (`orderNumber`);--> statement-breakpoint
CREATE INDEX `orders_email_idx` ON `orders` (`email`);--> statement-breakpoint
CREATE INDEX `wishlist_userId_idx` ON `wishlist` (`userId`);