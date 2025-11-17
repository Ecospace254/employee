import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("employee"), // employee, manager, hr
  jobTitle: text("job_title"),
  department: text("department"),
  bio: text("bio"),
  startDate: timestamp("start_date"),
  profileImage: text("profile_image"),
  managerId: varchar("manager_id"),
  isActive: boolean("is_active").default(true),
  // Personal information
  nationalId: text("national_id"),
  birthDate: date("birth_date"),
  gender: text("gender"),
  // Contact information
  mobile: text("mobile"),
  // Education information
  college: text("college"),
  degree: text("degree"),
  major: text("major"),
  educationStart: date("education_start"),
  educationEnd: date("education_end"),
});

export const checklistItems = pgTable("checklist_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  work: text("work").notNull(),
  description: text("description"),
  completeBy: timestamp("complete_by"),
  completed: boolean("completed").default(false),
  completedOn: timestamp("completed_on"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  mentorId: varchar("mentor_id").references(() => users.id),
  relevantLink: text("relevant_link"),
  relevantFiles: text("relevant_files"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const announcements = pgTable("announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"), // Uploaded image URL
  mediaLink: text("media_link"), // External link (YouTube, blog, etc.)
  authorId: varchar("author_id").references(() => users.id).notNull(), // Reference to user who posted
  viewCount: integer("view_count").default(0), // Track how many people viewed
  publishedAt: timestamp("published_at").default(sql`now()`),
  targetRole: text("target_role"),
});

// Saved announcements - many-to-many relationship between users and announcements
export const savedAnnouncements = pgTable("saved_announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  announcementId: varchar("announcement_id").references(() => announcements.id, { onDelete: 'cascade' }).notNull(),
  savedAt: timestamp("saved_at").defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  time: text("time").notNull(),
  location: text("location"),
  targetRole: text("target_role"),
});

export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  duration: text("duration"),
  difficulty: text("difficulty"),
  requiredRole: text("required_role"),
  thumbnail: text("thumbnail"),
});

export const resources = pgTable("resources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  fileUrl: text("file_url"),
  requiredRole: text("required_role"),
});

export const teamIntroductions = pgTable("team_introductions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  publishedAt: timestamp("published_at").default(sql`now()`),
  isApproved: boolean("is_approved").default(false),
});

// Password reset tokens table
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade'}). notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});




export const insertUserSchema = createInsertSchema(users, {
  // Transform nullable fields to empty strings for form compatibility
  email: z.string().min(1, "Email is required"),
  jobTitle: z.string().optional().default(""),
  department: z.string().optional().default(""),
  bio: z.string().optional().default(""),
  profileImage: z.string().optional(),
  managerId: z.string().optional(),
  // startDate is timestamp - accepts Date objects
  startDate: z.union([z.date(), z.string()]).optional(),
  // Personal information
  nationalId: z.string().optional(),
  birthDate: z.union([z.date(), z.string()]).optional(),
  gender: z.string().optional(),
  // Contact information
  mobile: z.string().optional(),
  // Education information - date type (strings)
  college: z.string().optional(),
  degree: z.string().optional(),
  major: z.string().optional(),
  educationStart: z.union([z.date(), z.string()]).optional(),
  educationEnd: z.union([z.date(), z.string()]).optional(),
}).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  jobTitle: true,
  department: true,
  bio: true,
  startDate: true,
  profileImage: true,
  managerId: true,
  isActive: true,
  nationalId: true,
  birthDate: true,
  gender: true,
  mobile: true,
  college: true,
  degree: true,
  major: true,
  educationStart: true,
  educationEnd: true,
});

export const insertTeamIntroductionSchema = createInsertSchema(teamIntroductions).omit({
  id: true,
  publishedAt: true,
});

export const insertChecklistItemSchema = createInsertSchema(checklistItems).omit({
  id: true,
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  publishedAt: true,
  viewCount: true, // Auto-managed by system
});

export const insertSavedAnnouncementSchema = createInsertSchema(savedAnnouncements).omit({
  id: true,
  savedAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
});

export const insertResourceSchema = createInsertSchema(resources).omit({
  id: true,
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type PublicUser = Omit<User, 'password'>;
export type TeamIntroduction = typeof teamIntroductions.$inferSelect;
export type InsertTeamIntroduction = z.infer<typeof insertTeamIntroductionSchema>;
export type ChecklistItem = typeof checklistItems.$inferSelect;
export type InsertChecklistItem = z.infer<typeof insertChecklistItemSchema>;
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type SavedAnnouncement = typeof savedAnnouncements.$inferSelect;
export type InsertSavedAnnouncement = z.infer<typeof insertSavedAnnouncementSchema>;