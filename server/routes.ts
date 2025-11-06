import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import multer from "multer";
import path from "path";
import fs from "fs";

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

  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
