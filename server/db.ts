import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function ensureEditorialTables() {
  const db = await getDb();
  if (!db) return;
  await db.execute(sql.raw(`CREATE TABLE IF NOT EXISTS \`artistProfiles\` (\`id\` int AUTO_INCREMENT NOT NULL, \`name\` varchar(180) NOT NULL, \`nameEn\` varchar(180), \`role\` varchar(240), \`roleEn\` varchar(240), \`bio\` text, \`bioEn\` text, \`imageUrl\` text, \`collaborationImageUrl\` text, \`sourceUrl\` varchar(1024), \`guitar\` varchar(240), \`published\` boolean NOT NULL DEFAULT true, \`sortOrder\` int NOT NULL DEFAULT 0, \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, CONSTRAINT \`artistProfiles_id\` PRIMARY KEY(\`id\`))`));
  await db.execute(sql.raw(`CREATE TABLE IF NOT EXISTS \`worksItems\` (\`id\` int AUTO_INCREMENT NOT NULL, \`kind\` enum('event','student') NOT NULL, \`title\` varchar(240) NOT NULL, \`titleEn\` varchar(240), \`eventDate\` varchar(120), \`description\` text, \`descriptionEn\` text, \`imageUrls\` json NOT NULL, \`sourceUrl\` varchar(1024), \`published\` boolean NOT NULL DEFAULT true, \`sortOrder\` int NOT NULL DEFAULT 0, \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, CONSTRAINT \`worksItems_id\` PRIMARY KEY(\`id\`))`));
}

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.
