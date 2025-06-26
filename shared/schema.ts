import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const configurations = pgTable("configurations", {
  id: serial("id").primaryKey(),
  alistUrl: text("alist_url").notNull(),
  alistToken: text("alist_token").notNull(),
  webhookUrl: text("webhook_url").notNull(),
  interval: integer("interval").notNull().default(10),
  isActive: boolean("is_active").notNull().default(false),
});

export const storages = pgTable("storages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  driver: text("driver").notNull(),
  mountPath: text("mount_path").notNull(),
  status: text("status").notNull(),
  lastCheck: timestamp("last_check").notNull(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // 'warning', 'error', 'info'
  status: text("status").notNull().default("pending"), // 'pending', 'sent', 'failed'
  createdAt: timestamp("created_at").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertConfigurationSchema = createInsertSchema(configurations).omit({
  id: true,
});

export const insertStorageSchema = createInsertSchema(storages).omit({
  id: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertConfiguration = z.infer<typeof insertConfigurationSchema>;
export type Configuration = typeof configurations.$inferSelect;

export type InsertStorage = z.infer<typeof insertStorageSchema>;
export type Storage = typeof storages.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
