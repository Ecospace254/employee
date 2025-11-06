import { type User, type InsertUser, type ChecklistItem, type InsertChecklistItem, users, checklistItems } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db } from "./db";
import { eq } from "drizzle-orm";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllActiveUsers(): Promise<User[]>;
  updateUserProfileImage(userId: string, imageUrl: string): Promise<User | undefined>;
  updateUserProfile(userId: string, updates: Partial<User>): Promise<User | undefined>;
  getChecklistItems(): Promise<ChecklistItem[]>;
  createChecklistItem(item: InsertChecklistItem): Promise<ChecklistItem>;
  updateChecklistItem(id: string, updates: Partial<InsertChecklistItem>): Promise<ChecklistItem | undefined>;
  deleteChecklistItem(id: string): Promise<boolean>;
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: any;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    // Initialize with default checklist items on startup
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    try {
      // Check if we already have checklist items
      const existingItems = await db.select().from(checklistItems).limit(1);
      if (existingItems.length === 0) {
        // Add default checklist item
        await db.insert(checklistItems).values({
          work: "Company Policies",
          description: "Ensure you have gone through all company policies and procedures",
          completeBy: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          completed: false,
          completedOn: null,
          assignedTo: null,
          mentorId: null,
          relevantLink: "/policies",
          relevantFiles: "Employee Handbook.pdf"
        });
      }
    } catch (error) {
      console.log("Note: Default data initialization skipped - database may not be ready yet");
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Convert Date objects to strings for date fields (birthDate, educationStart, educationEnd)
    // startDate is timestamp - accepts Date objects directly
    const userToInsert: any = {
      ...insertUser,
      birthDate: (insertUser.birthDate as any) instanceof Date 
        ? (insertUser.birthDate as any).toISOString().split('T')[0] // "YYYY-MM-DD"
        : insertUser.birthDate,
      educationStart: (insertUser.educationStart as any) instanceof Date
        ? (insertUser.educationStart as any).toISOString().split('T')[0]
        : insertUser.educationStart,
      educationEnd: (insertUser.educationEnd as any) instanceof Date
        ? (insertUser.educationEnd as any).toISOString().split('T')[0]
        : insertUser.educationEnd,
      // startDate stays as Date - timestamp() handles it
    };

    const [user] = await db
      .insert(users)
      .values(userToInsert)
      .returning();
    return user;
  }

  async getAllActiveUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.isActive, true));
  }

  async updateUserProfileImage(userId: string, imageUrl: string): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ profileImage: imageUrl })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser || undefined;
  }

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User | undefined> {
    // Filter out undefined values and fields that shouldn't be updated directly
    const allowedUpdates: Partial<User> = {};
    const restrictedFields = ['id', 'password', 'role', 'createdAt', 'isActive'];
    
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && !restrictedFields.includes(key)) {
        // Convert Date objects to strings for date fields (birthDate, educationStart, educationEnd)
        // startDate is timestamp - accepts Date objects directly
        if ((key === 'birthDate' || key === 'educationStart' || key === 'educationEnd') && (value as any) instanceof Date) {
          (allowedUpdates as any)[key] = (value as any).toISOString().split('T')[0];
        } else {
          (allowedUpdates as any)[key] = value;
        }
      }
    }

    if (Object.keys(allowedUpdates).length === 0) {
      return undefined;
    }

    const [updatedUser] = await db
      .update(users)
      .set(allowedUpdates)
      .where(eq(users.id, userId))
      .returning();
    return updatedUser || undefined;
  }

  async getChecklistItems(): Promise<ChecklistItem[]> {
    return await db.select().from(checklistItems);
  }

  async createChecklistItem(item: InsertChecklistItem): Promise<ChecklistItem> {
    const [checklistItem] = await db
      .insert(checklistItems)
      .values(item)
      .returning();
    return checklistItem;
  }

  async updateChecklistItem(id: string, updates: Partial<InsertChecklistItem>): Promise<ChecklistItem | undefined> {
    const [updatedItem] = await db
      .update(checklistItems)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(checklistItems.id, id))
      .returning();
    return updatedItem || undefined;
  }

  async deleteChecklistItem(id: string): Promise<boolean> {
    const result = await db
      .delete(checklistItems)
      .where(eq(checklistItems.id, id));
    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();