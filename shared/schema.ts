import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, real, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("citizen"), // citizen, worker, admin
  name: text("name").notNull(),
  phone: text("phone"),
  address: text("address"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  citizenId: varchar("citizen_id").notNull(),
  citizenName: text("citizen_name").notNull(),
  location: text("location").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  wasteType: text("waste_type").notNull(), // plastic, organic, recyclable, hazardous
  status: text("status").notNull().default("Pending"), // Pending, In-Progress, Collected, Not Collected
  priority: text("priority").notNull().default("Medium"),
  description: text("description"),
  photoUrl: text("photo_url"),
  proofPhotoUrl: text("proof_photo_url"),
  createdAt: timestamp("created_at").defaultNow(),
  assignedWorkerId: varchar("assigned_worker_id"),
  completedAt: timestamp("completed_at"),
});


export const citizens = pgTable("citizens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  address: text("address"),
  totalReports: integer("total_reports").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const rewards = pgTable("rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  citizenId: varchar("citizen_id").notNull(),
  points: integer("points").notNull().default(0),
  totalEarned: integer("total_earned").notNull().default(0),
  level: text("level").notNull().default("Bronze"), // Bronze, Silver, Gold, Platinum
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});


export const insertCitizenSchema = createInsertSchema(citizens).omit({
  id: true,
});

export const insertRewardSchema = createInsertSchema(rewards).omit({
  id: true,
  lastUpdated: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertCitizen = z.infer<typeof insertCitizenSchema>;
export type Citizen = typeof citizens.$inferSelect;
export type InsertReward = z.infer<typeof insertRewardSchema>;
export type Reward = typeof rewards.$inferSelect;
