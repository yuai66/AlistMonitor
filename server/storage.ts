import { 
  users, configurations, storages, notifications,
  type User, type InsertUser,
  type Configuration, type InsertConfiguration,
  type Storage, type InsertStorage,
  type Notification, type InsertNotification
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getConfiguration(): Promise<Configuration | undefined>;
  saveConfiguration(config: InsertConfiguration): Promise<Configuration>;
  
  getStorages(): Promise<Storage[]>;
  getStorage(id: number): Promise<Storage | undefined>;
  upsertStorage(storage: InsertStorage): Promise<Storage>;
  updateStorageStatus(id: number, status: string, lastCheck: Date): Promise<void>;
  
  getNotifications(): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  updateNotificationStatus(id: number, status: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getConfiguration(): Promise<Configuration | undefined> {
    const [config] = await db.select().from(configurations).limit(1);
    return config || undefined;
  }

  async saveConfiguration(insertConfig: InsertConfiguration): Promise<Configuration> {
    const existing = await this.getConfiguration();
    if (existing) {
      const [updated] = await db
        .update(configurations)
        .set({
          ...insertConfig,
          interval: insertConfig.interval ?? existing.interval,
          isActive: insertConfig.isActive ?? existing.isActive
        })
        .where(eq(configurations.id, existing.id))
        .returning();
      return updated;
    } else {
      const [config] = await db
        .insert(configurations)
        .values({
          ...insertConfig,
          interval: insertConfig.interval ?? 10,
          isActive: insertConfig.isActive ?? false
        })
        .returning();
      return config;
    }
  }

  async getStorages(): Promise<Storage[]> {
    return await db.select().from(storages);
  }

  async getStorage(id: number): Promise<Storage | undefined> {
    const [storage] = await db.select().from(storages).where(eq(storages.id, id));
    return storage || undefined;
  }

  async upsertStorage(insertStorage: InsertStorage): Promise<Storage> {
    const [existing] = await db
      .select()
      .from(storages)
      .where(eq(storages.name, insertStorage.name));

    if (existing) {
      const [updated] = await db
        .update(storages)
        .set(insertStorage)
        .where(eq(storages.id, existing.id))
        .returning();
      return updated;
    } else {
      const [storage] = await db
        .insert(storages)
        .values(insertStorage)
        .returning();
      return storage;
    }
  }

  async updateStorageStatus(id: number, status: string, lastCheck: Date): Promise<void> {
    await db
      .update(storages)
      .set({ status, lastCheck })
      .where(eq(storages.id, id));
  }

  async getNotifications(): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .orderBy(notifications.createdAt);
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values({
        ...insertNotification,
        status: insertNotification.status || 'pending'
      })
      .returning();
    return notification;
  }

  async updateNotificationStatus(id: number, status: string): Promise<void> {
    await db
      .update(notifications)
      .set({ status })
      .where(eq(notifications.id, id));
  }
}

export const storage = new DatabaseStorage();
