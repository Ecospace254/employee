import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import multer from "multer";
import path from "path";
import fs from "fs";
import { generatePasswordResetToken, getTokenExpiry, isTokenExpired } from "./tokenUtils";
import { sendPasswordResetEmail } from "./email";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads", "profile-images");

// Create upload directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage for uploaded files
const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename: userId-timestamp.extension
    const userId = (req.user as any)?.id || 'unknown';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `user-${userId}-${uniqueSuffix}${ext}`);
  }
});

// File filter to only accept images
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Create multer upload instance
const upload = multer({
  storage: multerStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  },
  fileFilter: fileFilter
});

export async function registerRoutes(app: Express): Promise<Server> {
  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Team members API routes - requires authentication
  app.get("/api/team-members", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const users = await storage.getAllActiveUsers();
      // Return only directory-safe fields
      const directoryUsers = users.map(user => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        jobTitle: user.jobTitle,
        department: user.department,
        profileImage: user.profileImage,
        role: user.role,
        startDate: user.startDate
      }));
      res.json(directoryUsers);
    } catch (error) {
      console.error("Error fetching team members:", error);
      res.status(500).json({ error: "Failed to fetch team members" });
    }
  });

  // Checklist API routes - requires authentication
  app.get("/api/checklist", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const items = await storage.getChecklistItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching checklist items:", error);
      res.status(500).json({ error: "Failed to fetch checklist items" });
    }
  });

  app.post("/api/checklist", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const newItem = await storage.createChecklistItem(req.body);
      res.status(201).json(newItem);
    } catch (error) {
      console.error("Error creating checklist item:", error);
      res.status(500).json({ error: "Failed to create checklist item" });
    }
  });

  app.put("/api/checklist/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const updated = await storage.updateChecklistItem(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Checklist item not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating checklist item:", error);
      res.status(500).json({ error: "Failed to update checklist item" });
    }
  });

  app.delete("/api/checklist/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const deleted = await storage.deleteChecklistItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Checklist item not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting checklist item:", error);
      res.status(500).json({ error: "Failed to delete checklist item" });
    }
  });

  // Profile photo upload endpoint
  app.post("/api/user/profile-image", upload.single('profileImage'), async (req, res) => {
    // Check authentication
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const user = req.user as any;
      const userId = user.id;

      // Create the public URL for the uploaded image
      const imageUrl = `/uploads/profile-images/${req.file.filename}`;

      // Update user's profile image in database
      await storage.updateUserProfileImage(userId, imageUrl);

      // Delete old profile image file if it exists
      if (user.profileImage && user.profileImage.startsWith('/uploads/')) {
        const oldImagePath = path.join(process.cwd(), user.profileImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      res.json({
        success: true,
        imageUrl: imageUrl,
        message: "Profile image updated successfully"
      });

    } catch (error) {
      console.error("Error uploading profile image:", error);
      
      // Delete uploaded file if there was an error
      if (req.file) {
        const filePath = path.join(uploadDir, req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      res.status(500).json({ error: "Failed to upload profile image" });
    }
  });

  // Update user profile fields endpoint
  app.patch("/api/user/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const user = req.user as any;
      const userId = user.id;

      // Define allowed fields that can be updated
      const allowedFields = [
        'firstName', 'lastName', 'jobTitle', 'department',
        'nationalId', 'birthDate', 'gender', 'mobile',
        'college', 'degree', 'major', 'educationStart', 'educationEnd'
      ];

      // Filter and extract only allowed fields from request body
      const updates: Record<string, any> = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      }

      // Check if there are any fields to update
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "No valid fields to update" });
      }

      // Update user profile in database
      const updatedUser = await storage.updateUserProfile(userId, updates);

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Return updated user (without password)
      const { password, ...safeUser } = updatedUser;
      
      res.json({
        success: true,
        user: safeUser,
        message: "Profile updated successfully"
      });

    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // ============================================
  // PASSWORD MANAGEMENT ROUTES
  // ============================================

  /**
   * CHANGE PASSWORD - For logged-in users
   * POST /api/auth/change-password
   * Body: { currentPassword, newPassword }
   */
  app.post("/api/auth/change-password", async (req, res) => {
    // Check if user is logged in
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { currentPassword, newPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    // Validate new password length
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters long" });
    }

    try {
      const user = req.user as any;

      // Step 1: Verify current password is correct
      const isValid = await storage.verifyUserPassword(user.id, currentPassword);
      if (!isValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      // Step 2: Update to new password (will be hashed in storage method)
      await storage.updateUserPassword(user.id, newPassword);
      
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  /**
   * FORGOT PASSWORD - Request reset link
   * POST /api/auth/forgot-password
   * Body: { email }
   */
  app.post("/api/auth/forgot-password", async (req, res) => {
    const { email } = req.body;

    // Validate email provided
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    try {
      // Step 1: Find user by email
      const user = await storage.getUserByEmail(email);
      
      // If user doesn't exist, return clear error message
      if (!user) {
        return res.status(404).json({ message: "Email address not found. Please check and try again." });
      }

      // Step 2: Generate secure random token
      const resetToken = generatePasswordResetToken();
      
      // Step 3: Calculate expiry time (10 minutes from now)
      const expiresAt = getTokenExpiry();

      // Step 4: Save token to database (deletes old tokens automatically)
      await storage.createPasswordResetToken(user.id, resetToken, expiresAt);

      // Step 5: Send email with reset link
      try {
        await sendPasswordResetEmail(user.email, resetToken, user.firstName || "User");
        res.json({ message: "Password reset link has been sent to your email address. Please check your inbox." });
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        // Email failed but token is saved, so user could still reset if we had the link
        res.status(500).json({ 
          message: "Email service is not configured. Please contact your administrator or try the 'Change Password' option if you're logged in." 
        });
      }
    } catch (error) {
      console.error("Error in forgot password:", error);
      res.status(500).json({ message: "Failed to process password reset request. Please try again later." });
    }
  });

  /**
   * RESET PASSWORD - Use token from email to set new password
   * POST /api/auth/reset-password
   * Body: { token, newPassword }
   */
  app.post("/api/auth/reset-password", async (req, res) => {
    const { token, newPassword } = req.body;

    // Validate required fields
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    // Validate password length
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    try {
      // Step 1: Find token in database
      const resetToken = await storage.findPasswordResetToken(token);

      if (!resetToken) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      // Step 2: Check if token is expired (older than 10 minutes)
      if (isTokenExpired(resetToken.expiresAt)) {
        // Delete expired token
        await storage.deletePasswordResetToken(token);
        return res.status(400).json({ message: "Reset token has expired. Please request a new one." });
      }

      // Step 3: Update user password (will be hashed in storage method)
      await storage.updateUserPassword(resetToken.userId, newPassword);

      // Step 4: Delete the used token (one-time use)
      await storage.deletePasswordResetToken(token);

      res.json({ message: "Password reset successfully. You can now login with your new password." });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // ============================================
  // ANNOUNCEMENT ROUTES
  // ============================================

  /**
   * GET all announcements with author info
   */
  app.get("/api/announcements", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const announcements = await storage.getAllAnnouncements();
      const user = req.user as any;
      
      // Get saved announcements for current user
      const savedIds = await storage.getSavedAnnouncements(user.id);
      
      // Add isSaved flag to each announcement
      const announcementsWithSaved = announcements.map(announcement => ({
        ...announcement,
        isSaved: savedIds.includes(announcement.id)
      }));
      
      res.json(announcementsWithSaved);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ error: "Failed to fetch announcements" });
    }
  });

  /**
   * CREATE new announcement with image upload OR media link
   */
  app.post("/api/announcements", upload.single('image'), async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const user = req.user as any;
      const { title, content, mediaLink } = req.body;

      if (!title || !content) {
        return res.status(400).json({ error: "Title and content are required" });
      }

      // Get image URL if uploaded (from multer)
      const imageUrl = req.file ? `/uploads/profile-images/${req.file.filename}` : null;

      // User can provide EITHER an image OR a link (not both required)
      // But at least one should be provided for better UX
      const finalMediaLink = mediaLink || null;

      const newAnnouncement = await storage.createAnnouncement({
        title,
        content,
        imageUrl,
        mediaLink: finalMediaLink,
        authorId: user.id,
        targetRole: null
      });

      res.status(201).json(newAnnouncement);
    } catch (error) {
      console.error("Error creating announcement:", error);
      res.status(500).json({ error: "Failed to create announcement" });
    }
  });

  /**
   * INCREMENT view count for an announcement
   */
  app.post("/api/announcements/:id/view", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      await storage.incrementAnnouncementViews(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error incrementing views:", error);
      res.status(500).json({ error: "Failed to increment views" });
    }
  });

  /**
   * SAVE announcement for user
   */
  app.post("/api/announcements/:id/save", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const user = req.user as any;
      await storage.saveAnnouncement(user.id, req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving announcement:", error);
      res.status(500).json({ error: "Failed to save announcement" });
    }
  });

  /**
   * UNSAVE announcement for user
   */
  app.delete("/api/announcements/:id/save", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const user = req.user as any;
      await storage.unsaveAnnouncement(user.id, req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error unsaving announcement:", error);
      res.status(500).json({ error: "Failed to unsave announcement" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
