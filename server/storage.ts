import { type User, type InsertUser, type ChecklistItem, type InsertChecklistItem, users, checklistItems, passwordResetTokens, type PasswordResetToken, type InsertPasswordResetToken, type Announcement, type InsertAnnouncement, announcements, type SavedAnnouncement, savedAnnouncements, type Event, type InsertEvent, events, type EventParticipant, type InsertEventParticipant, eventParticipants } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db } from "./db";
import { eq, desc, and, sql, gte, lte, or } from "drizzle-orm";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllActiveUsers(): Promise<User[]>;
  updateUserProfileImage(userId: string, imageUrl: string): Promise<User | undefined>;
  updateUserProfile(userId: string, updates: Partial<User>): Promise<User | undefined>;
  getChecklistItems(): Promise<ChecklistItem[]>;
  createChecklistItem(item: InsertChecklistItem): Promise<ChecklistItem>;
  updateChecklistItem(id: string, updates: Partial<InsertChecklistItem>): Promise<ChecklistItem | undefined>;
  deleteChecklistItem(id: string): Promise<boolean>;
  // Password management methods
  createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<PasswordResetToken>;
  findPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  deletePasswordResetToken(token: string): Promise<void>;
  deleteAllUserTokens(userId: string): Promise<void>;
  updateUserPassword(userId: string, newPassword: string): Promise<void>;
  verifyUserPassword(userId: string, password: string): Promise<boolean>;
  // Announcement methods
  getAllAnnouncements(): Promise<(Announcement & { author: User })[]>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  deleteAnnouncement(id: string, userId: string): Promise<boolean>;
  incrementAnnouncementViews(id: string): Promise<void>;
  saveAnnouncement(userId: string, announcementId: string): Promise<SavedAnnouncement>;
  unsaveAnnouncement(userId: string, announcementId: string): Promise<boolean>;
  isAnnouncementSaved(userId: string, announcementId: string): Promise<boolean>;
  getSavedAnnouncements(userId: string): Promise<string[]>;
  // Event methods
  getEvents(filters?: { eventType?: string; startDate?: string; endDate?: string; userId?: string }): Promise<(Event & { organizer: User; participantCount?: number })[]>;
  getEventById(id: string): Promise<(Event & { organizer: User; participants: (EventParticipant & { user: User })[] }) | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, updates: Partial<InsertEvent>, userId: string): Promise<Event | undefined>;
  deleteEvent(id: string, userId: string): Promise<boolean>;
  getEventParticipants(eventId: string): Promise<(EventParticipant & { user: User })[]>;
  addEventParticipants(eventId: string, userIds: string[]): Promise<EventParticipant[]>;
  updateParticipantStatus(eventId: string, userId: string, status: string): Promise<EventParticipant | undefined>;
  getUpcomingEvents(userId: string, limit: number): Promise<(Event & { organizer: User; participantStatus?: string })[]>;
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

  // ============================================
  // PASSWORD MANAGEMENT METHODS
  // ============================================

  /**
   * Get user by email - used in forgot password flow
   */
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return user || undefined;
  }

  /**
   * Create password reset token - deletes old tokens first (one per user)
   */
  async createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<PasswordResetToken> {
    // Delete old tokens for this user (one token per user rule)
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
    
    // Create new token
    const [newToken] = await db
      .insert(passwordResetTokens)
      .values({ userId, token, expiresAt })
      .returning();
    
    return newToken;
  }

  /**
   * Find password reset token by token string
   */
  async findPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token))
      .limit(1);
    
    return resetToken || undefined;
  }

  /**
   * Delete a specific password reset token
   */
  async deletePasswordResetToken(token: string): Promise<void> {
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token));
  }

  /**
   * Delete all password reset tokens for a user
   */
  async deleteAllUserTokens(userId: string): Promise<void> {
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
  }

  /**
   * Update user password - hashes password before storing
   * NOTE: Uses scrypt (same as auth.ts) for consistency with existing system
   */
  async updateUserPassword(userId: string, newPassword: string): Promise<void> {
    // Use scrypt hashing (same as registration) for consistency
    const { scrypt, randomBytes } = await import('crypto');
    const { promisify } = await import('util');
    const scryptAsync = promisify(scrypt);
    
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(newPassword, salt, 64)) as Buffer;
    const hashedPassword = `${buf.toString("hex")}.${salt}`;
    
    // Update in database
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, userId));
  }

  /**
   * Verify user password - compares plain password with hashed version
   * NOTE: Uses scrypt (same as auth.ts) to match existing password hashes
   */
  async verifyUserPassword(userId: string, password: string): Promise<boolean> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (!user) return false;
    
    // Use scrypt comparison (same as auth.ts)
    const { scrypt, timingSafeEqual } = await import('crypto');
    const { promisify } = await import('util');
    const scryptAsync = promisify(scrypt);
    
    const [hashed, salt] = user.password.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(password, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  }

  // ============================================
  // ANNOUNCEMENT METHODS
  // ============================================

  /**
   * Get all announcements with author information
   * Joins with users table to get author details (name, image)
   */
  async getAllAnnouncements(): Promise<(Announcement & { author: User })[]> {
    const result = await db
      .select()
      .from(announcements)
      .leftJoin(users, eq(announcements.authorId, users.id))
      .orderBy(desc(announcements.publishedAt));

    return result.map((row) => ({
      ...row.announcements,
      author: row.users!,
    }));
  }

  /**
   * Create a new announcement
   */
  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const [newAnnouncement] = await db
      .insert(announcements)
      .values(announcement)
      .returning();
    return newAnnouncement;
  }

  /**
   * Delete an announcement (only if user is the author)
   */
  async deleteAnnouncement(id: string, userId: string): Promise<boolean> {
    // First check if the announcement exists and belongs to the user
    const [announcement] = await db
      .select()
      .from(announcements)
      .where(eq(announcements.id, id))
      .limit(1);

    if (!announcement) {
      return false; // Announcement not found
    }

    if (announcement.authorId !== userId) {
      return false; // User is not the author
    }

    // Delete associated saved announcements first (foreign key constraint)
    await db
      .delete(savedAnnouncements)
      .where(eq(savedAnnouncements.announcementId, id));

    // Delete the announcement
    const result = await db
      .delete(announcements)
      .where(eq(announcements.id, id));

    return true;
  }

  /**
   * Increment view count for an announcement
   * Called when a user views the announcement details
   */
  async incrementAnnouncementViews(id: string): Promise<void> {
    await db
      .update(announcements)
      .set({ viewCount: sql`${announcements.viewCount} + 1` })
      .where(eq(announcements.id, id));
  }

  /**
   * Save an announcement for a user
   */
  async saveAnnouncement(userId: string, announcementId: string): Promise<SavedAnnouncement> {
    const [saved] = await db
      .insert(savedAnnouncements)
      .values({ userId, announcementId })
      .returning();
    return saved;
  }

  /**
   * Unsave an announcement for a user
   */
  async unsaveAnnouncement(userId: string, announcementId: string): Promise<boolean> {
    const result = await db
      .delete(savedAnnouncements)
      .where(
        and(
          eq(savedAnnouncements.userId, userId),
          eq(savedAnnouncements.announcementId, announcementId)
        )
      );
    return (result.rowCount || 0) > 0;
  }

  /**
   * Check if an announcement is saved by a user
   */
  async isAnnouncementSaved(userId: string, announcementId: string): Promise<boolean> {
    const [saved] = await db
      .select()
      .from(savedAnnouncements)
      .where(
        and(
          eq(savedAnnouncements.userId, userId),
          eq(savedAnnouncements.announcementId, announcementId)
        )
      )
      .limit(1);
    return !!saved;
  }

  /**
   * Get all saved announcement IDs for a user
   * Returns array of announcement IDs
   */
  async getSavedAnnouncements(userId: string): Promise<string[]> {
    const saved = await db
      .select({ announcementId: savedAnnouncements.announcementId })
      .from(savedAnnouncements)
      .where(eq(savedAnnouncements.userId, userId));
    return saved.map((s) => s.announcementId);
  }

  // ============================================
  // EVENT METHODS
  // ============================================

  /**
   * Get events with optional filters
   */
  async getEvents(filters?: { 
    eventType?: string; 
    startDate?: string; 
    endDate?: string; 
    userId?: string 
  }): Promise<(Event & { organizer: User; participantCount?: number })[]> {
    let query = db
      .select({
        event: events,
        organizer: users,
      })
      .from(events)
      .leftJoin(users, eq(events.organizerId, users.id))
      .$dynamic();

    const conditions = [];

    if (filters?.eventType) {
      conditions.push(eq(events.eventType, filters.eventType));
    }

    if (filters?.startDate) {
      conditions.push(gte(events.startTime, new Date(filters.startDate)));
    }

    if (filters?.endDate) {
      conditions.push(lte(events.endTime, new Date(filters.endDate)));
    }

    if (filters?.userId) {
      // Get events where user is organizer OR participant
      const participantEvents = await db
        .select({ eventId: eventParticipants.eventId })
        .from(eventParticipants)
        .where(eq(eventParticipants.userId, filters.userId));
      
      const participantEventIds = participantEvents.map(p => p.eventId);
      
      if (participantEventIds.length > 0) {
        conditions.push(
          or(
            eq(events.organizerId, filters.userId),
            sql`${events.id} IN ${participantEventIds}`
          )
        );
      } else {
        conditions.push(eq(events.organizerId, filters.userId));
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.orderBy(events.startTime);

    // Get participant counts
    const eventsWithCounts = await Promise.all(
      results.map(async (result) => {
        const [countResult] = await db
          .select({ count: sql<number>`count(*)` })
          .from(eventParticipants)
          .where(eq(eventParticipants.eventId, result.event.id));

        return {
          ...result.event,
          organizer: result.organizer!,
          participantCount: Number(countResult.count) || 0,
        };
      })
    );

    return eventsWithCounts;
  }

  /**
   * Get single event by ID with full details
   */
  async getEventById(id: string): Promise<(Event & { 
    organizer: User; 
    participants: (EventParticipant & { user: User })[] 
  }) | undefined> {
    const [result] = await db
      .select({
        event: events,
        organizer: users,
      })
      .from(events)
      .leftJoin(users, eq(events.organizerId, users.id))
      .where(eq(events.id, id));

    if (!result) return undefined;

    const participants = await this.getEventParticipants(id);

    return {
      ...result.event,
      organizer: result.organizer!,
      participants,
    };
  }

  /**
   * Create new event
   */
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    // Convert string dates to Date objects if needed
    const eventToInsert = {
      ...insertEvent,
      startTime: typeof insertEvent.startTime === 'string' 
        ? new Date(insertEvent.startTime) 
        : insertEvent.startTime,
      endTime: typeof insertEvent.endTime === 'string'
        ? new Date(insertEvent.endTime)
        : insertEvent.endTime,
    };

    const [event] = await db.insert(events).values(eventToInsert).returning();
    return event;
  }

  /**
   * Update event (only by organizer)
   */
  async updateEvent(
    id: string, 
    updates: Partial<InsertEvent>, 
    userId: string
  ): Promise<Event | undefined> {
    // Verify user is the organizer
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);

    if (!event || event.organizerId !== userId) {
      return undefined;
    }

    // Convert string dates to Date objects if needed
    const updatesToApply: any = { ...updates, updatedAt: new Date() };
    if (updates.startTime && typeof updates.startTime === 'string') {
      updatesToApply.startTime = new Date(updates.startTime);
    }
    if (updates.endTime && typeof updates.endTime === 'string') {
      updatesToApply.endTime = new Date(updates.endTime);
    }

    const [updated] = await db
      .update(events)
      .set(updatesToApply)
      .where(eq(events.id, id))
      .returning();

    return updated;
  }

  /**
   * Delete event (only by organizer)
   */
  async deleteEvent(id: string, userId: string): Promise<boolean> {
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);

    if (!event || event.organizerId !== userId) {
      return false;
    }

    await db.delete(events).where(eq(events.id, id));
    return true;
  }

  /**
   * Get all participants for an event
   */
  async getEventParticipants(eventId: string): Promise<(EventParticipant & { user: User })[]> {
    const participants = await db
      .select({
        participant: eventParticipants,
        user: users,
      })
      .from(eventParticipants)
      .leftJoin(users, eq(eventParticipants.userId, users.id))
      .where(eq(eventParticipants.eventId, eventId));

    return participants.map((p) => ({
      ...p.participant,
      user: p.user!,
    }));
  }

  /**
   * Add multiple participants to an event
   */
  async addEventParticipants(eventId: string, userIds: string[]): Promise<EventParticipant[]> {
    const participantsToAdd = userIds.map((userId) => ({
      eventId,
      userId,
      status: 'pending' as const,
    }));

    const added = await db
      .insert(eventParticipants)
      .values(participantsToAdd)
      .onConflictDoNothing()
      .returning();

    return added;
  }

  /**
   * Update participant RSVP status
   */
  async updateParticipantStatus(
    eventId: string,
    userId: string,
    status: string
  ): Promise<EventParticipant | undefined> {
    const [updated] = await db
      .update(eventParticipants)
      .set({ 
        status, 
        respondedAt: new Date() 
      })
      .where(
        and(
          eq(eventParticipants.eventId, eventId),
          eq(eventParticipants.userId, userId)
        )
      )
      .returning();

    return updated;
  }

  /**
   * Get upcoming events for a user (for sidebar)
   */
  async getUpcomingEvents(
    userId: string, 
    limit: number
  ): Promise<(Event & { organizer: User; participantStatus?: string })[]> {
    const now = new Date();

    // Get events where user is organizer or participant
    const userEvents = await db
      .select({
        event: events,
        organizer: users,
        participantStatus: eventParticipants.status,
      })
      .from(events)
      .leftJoin(users, eq(events.organizerId, users.id))
      .leftJoin(
        eventParticipants,
        and(
          eq(eventParticipants.eventId, events.id),
          eq(eventParticipants.userId, userId)
        )
      )
      .where(
        and(
          gte(events.startTime, now),
          or(
            eq(events.organizerId, userId),
            eq(eventParticipants.userId, userId)
          )
        )
      )
      .orderBy(events.startTime)
      .limit(limit);

    return userEvents.map((result) => ({
      ...result.event,
      organizer: result.organizer!,
      participantStatus: result.participantStatus || undefined,
    }));
  }
}

export const storage = new DatabaseStorage();