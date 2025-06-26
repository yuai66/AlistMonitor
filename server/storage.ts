import { 
  users, configurations, storages, notifications,
  type User, type InsertUser,
  type Configuration, type InsertConfiguration,
  type Storage, type InsertStorage,
  type Notification, type InsertNotification
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private configurations: Map<number, Configuration>;
  private storages: Map<number, Storage>;
  private notifications: Map<number, Notification>;
  
  private currentUserId: number;
  private currentConfigId: number;
  private currentStorageId: number;
  private currentNotificationId: number;

  constructor() {
    this.users = new Map();
    this.configurations = new Map();
    this.storages = new Map();
    this.notifications = new Map();
    
    this.currentUserId = 1;
    this.currentConfigId = 1;
    this.currentStorageId = 1;
    this.currentNotificationId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getConfiguration(): Promise<Configuration | undefined> {
    return Array.from(this.configurations.values())[0];
  }

  async saveConfiguration(insertConfig: InsertConfiguration): Promise<Configuration> {
    const existing = await this.getConfiguration();
    if (existing) {
      const updated: Configuration = { ...existing, ...insertConfig };
      this.configurations.set(existing.id, updated);
      return updated;
    } else {
      const id = this.currentConfigId++;
      const config: Configuration = { ...insertConfig, id };
      this.configurations.set(id, config);
      return config;
    }
  }

  async getStorages(): Promise<Storage[]> {
    return Array.from(this.storages.values());
  }

  async getStorage(id: number): Promise<Storage | undefined> {
    return this.storages.get(id);
  }

  async upsertStorage(insertStorage: InsertStorage): Promise<Storage> {
    const existing = Array.from(this.storages.values()).find(
      s => s.name === insertStorage.name && s.mountPath === insertStorage.mountPath
    );
    
    if (existing) {
      const updated: Storage = { ...existing, ...insertStorage };
      this.storages.set(existing.id, updated);
      return updated;
    } else {
      const id = this.currentStorageId++;
      const storage: Storage = { ...insertStorage, id };
      this.storages.set(id, storage);
      return storage;
    }
  }

  async updateStorageStatus(id: number, status: string, lastCheck: Date): Promise<void> {
    const storage = this.storages.get(id);
    if (storage) {
      storage.status = status;
      storage.lastCheck = lastCheck;
      this.storages.set(id, storage);
    }
  }

  async getNotifications(): Promise<Notification[]> {
    return Array.from(this.notifications.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.currentNotificationId++;
    const notification: Notification = { ...insertNotification, id };
    this.notifications.set(id, notification);
    return notification;
  }

  async updateNotificationStatus(id: number, status: string): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.status = status;
      this.notifications.set(id, notification);
    }
  }
}

export const storage = new MemStorage();
