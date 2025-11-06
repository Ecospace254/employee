# Employee Onboarding Portal - Migration Guide

## 📋 Overview

This document details the challenges encountered when migrating a Replit-based employee onboarding application to a Windows development environment, and the solutions implemented to resolve them.

**Original Environment:** Replit (Linux-based cloud platform)  
**Target Environment:** Windows 10/11 with local PostgreSQL database  
**Application Stack:** React + Express + TypeScript + PostgreSQL + Drizzle ORM

---

## 🚨 Challenges Faced & Solutions

### Challenge #1: Server Startup Failure - `ENOTSUP` Error

#### **The Problem**
When running `npm run dev`, the server crashed immediately with the following error:

```
Error: listen ENOTSUP: operation not supported on socket 0.0.0.0:5000
    at Server.setupListenHandle [as _listen2] (node:net:1915:21)
{
  code: 'ENOTSUP',
  errno: -4049,
  syscall: 'listen',
  address: '0.0.0.0',
  port: 5000
}
```

#### **Root Cause**
The code was using the `reusePort: true` option when starting the HTTP server:

```typescript
server.listen({
  port,
  host: "0.0.0.0",
  reusePort: true,  // ❌ Not supported on Windows
}, () => {
  log(`serving on port ${port}`);
});
```

**Why it failed:**
- `reusePort` is a Linux/Unix feature that allows multiple processes to bind to the same port
- Windows does **not** support this socket option
- Replit runs on Linux, so this worked fine there but broke on Windows

#### **The Solution**
Modified `server/index.ts` to conditionally set `reusePort` only on non-Windows platforms:

```typescript
const port = parseInt(process.env.PORT || '5000', 10);

// reusePort is not supported on Windows, so we only set it on Linux/Mac
const listenOptions: any = {
  port,
  host: "0.0.0.0",
};

if (process.platform !== "win32") {
  listenOptions.reusePort = true;
}

server.listen(listenOptions, () => {
  log(`serving on port ${port}`);
});
```

**Result:** ✅ Server now starts successfully on Windows

**File Modified:** `server/index.ts` (lines 67-80)

---

### Challenge #2: Vite Asset Import Failure

#### **The Problem**
After starting the server, Vite threw errors when trying to load page components:

```
Pre-transform error: Failed to resolve import "@assets/stock_images/team_collaboration_m_50dd010c.jpg" 
from "client/src/pages/HowWeWork.tsx". Does the file exist?
```

The application tried to import images but couldn't find them, even though the files existed in the project.

#### **Root Cause**
The Vite configuration had an incorrect path alias:

```typescript
// vite.config.ts - INCORRECT
resolve: {
  alias: {
    "@": path.resolve(import.meta.dirname, "client", "src"),
    "@shared": path.resolve(import.meta.dirname, "shared"),
    "@assets": path.resolve(import.meta.dirname, "attached_assets"), // ❌ Wrong folder
  },
},
```

**Why it failed:**
- The alias `@assets` pointed to `attached_assets` folder (which doesn't exist)
- The actual images were in the `assets` folder
- This was likely a typo or folder rename during the Replit export

**Project Structure:**
```
Employee/
├── assets/                    ✅ Images are here
│   └── stock_images/
│       ├── team_collaboration_m_50dd010c.jpg
│       ├── diverse_team_hands_t_070ee7f7.jpg
│       └── ...
├── attached_assets/           ❌ This folder doesn't exist
```

#### **The Solution**
Corrected the path alias in `vite.config.ts`:

```typescript
resolve: {
  alias: {
    "@": path.resolve(import.meta.dirname, "client", "src"),
    "@shared": path.resolve(import.meta.dirname, "shared"),
    "@assets": path.resolve(import.meta.dirname, "assets"), // ✅ Fixed
  },
},
```

**Result:** ✅ Vite can now resolve and bundle image imports correctly

**File Modified:** `vite.config.ts` (line 20)

**Note:** After making this change, you must restart the dev server (`Ctrl+C` then `npm run dev`)

---

### Challenge #3: Database Connection Failure

#### **The Problem**
The server started but showed a persistent warning:

```
10:26:14 AM [express] serving on port 5000
Note: Default data initialization skipped - database may not be ready yet
```

When attempting to log in, the application crashed with:

```
Error: connect ECONNREFUSED 192.148.2.79:443
    at NeonPreparedQuery.execute
    at DatabaseStorage.getUserByUsername
```

**Key observations:**
- The error showed port `443` (HTTPS) instead of `5432` (PostgreSQL)
- Network tests confirmed PostgreSQL at `192.148.2.79:5432` was reachable
- Database credentials were correct in `.env` file

#### **Root Cause**
The application was using **Neon's serverless database driver**, which is designed for Neon's cloud-hosted PostgreSQL service:

```typescript
// server/db.ts - ORIGINAL (WRONG for local PostgreSQL)
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";

neonConfig.webSocketConstructor = ws;

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
```

**Why it failed:**
- **Neon's driver** uses WebSockets over HTTPS (port 443) to connect to Neon's cloud infrastructure
- This driver is optimized for serverless environments (Replit, Vercel, Cloudflare Workers)
- A **standard self-hosted PostgreSQL server** uses the PostgreSQL wire protocol over port 5432
- The Neon driver tried to connect using HTTPS/WebSocket instead of the native PostgreSQL protocol

**Connection Architecture:**
```
❌ What was happening:
App → Neon Driver → WebSocket/HTTPS (port 443) → ❌ Regular PostgreSQL rejected it

✅ What should happen:
App → Standard Driver → PostgreSQL Protocol (port 5432) → ✅ PostgreSQL accepted it
```

#### **The Solution**

**Step 1: Install standard PostgreSQL drivers**
```bash
npm install pg
npm install --save-dev @types/pg
```

**Step 2: Update database configuration**

Replaced `server/db.ts` with standard PostgreSQL setup:

```typescript
// server/db.ts - CORRECTED
import { Pool } from 'pg';                          // ✅ Standard PostgreSQL driver
import { drizzle } from 'drizzle-orm/node-postgres'; // ✅ Node-Postgres adapter
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
```

**Key Changes:**
- Replaced `@neondatabase/serverless` with standard `pg` package
- Replaced `drizzle-orm/neon-serverless` with `drizzle-orm/node-postgres`
- Removed WebSocket configuration (not needed for standard PostgreSQL)

**Environment Configuration:**

`.env` file contains:
```properties
DATABASE_URL=postgresql://fawiti:junior@254@192.148.2.79:5432/employee?
```

**Result:** ✅ Database connection established successfully

**Evidence of success:**
- Warning message disappeared
- Default checklist items were created
- User authentication now works
- All database operations function correctly

**Files Modified:** 
- `server/db.ts` (complete rewrite)
- `package.json` (dependencies updated)

---

## 🔧 Technical Explanation: Why Different Drivers Matter

### Database Driver Comparison

| Aspect | Neon Serverless | Standard node-postgres |
|--------|----------------|------------------------|
| **Protocol** | WebSocket/HTTPS | PostgreSQL wire protocol |
| **Port** | 443 | 5432 |
| **Use Case** | Neon cloud databases | Self-hosted PostgreSQL |
| **Environment** | Serverless (Replit, Vercel) | Traditional Node.js servers |
| **Connection Pooling** | Managed by Neon | Managed locally |
| **Latency** | Higher (internet roundtrip) | Lower (local network) |

### The Database Stack

Your application uses this stack to communicate with PostgreSQL:

```
┌─────────────────────────────────────┐
│   Application Code (TypeScript)    │
│   Example: storage.createUser()    │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│         Drizzle ORM                 │
│   Provides type-safe query builder │
│   db.select().from(users).where()  │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│  drizzle-orm/node-postgres adapter │
│   Translates Drizzle to SQL        │
│   Handles PostgreSQL-specific data │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│       'pg' Driver (node-postgres)   │
│   Manages connection & protocol    │
│   Sends SQL over TCP port 5432     │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│   PostgreSQL Server                │
│   192.148.2.79:5432                │
└─────────────────────────────────────┘
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database accessible on your network
- Windows 10/11 (or macOS/Linux)

### Installation Steps

1. **Clone/Download the project**
   ```bash
   cd d:\2025Projects\Ecospace\Employee
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create/verify `.env` file in project root:
   ```properties
   DATABASE_URL=postgresql://username:password@host:5432/database_name
   PORT=5000
   ```

4. **Run database migrations** (if needed)
   ```bash
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   
      Open browser to: `http://localhost:5000`

---

## 🖼️ Profile Photo Upload with Cropping

A complete guide to implementing profile photo upload with image cropping in a React + Express application.

---

## 📦 Step 1: Install Required Packages

```bash
npm install multer react-image-crop
npm install --save-dev @types/multer
```

**What these packages do:**
- `multer` - Handles file uploads on the backend
- `react-image-crop` - Provides image cropping UI on the frontend
- `@types/multer` - TypeScript types for multer

---

## 🗄️ Step 2: Database Layer

### Add method to `server/storage.ts`

**1. Update the IStorage interface:**
```typescript
export interface IStorage {
  // ... existing methods
  updateUserProfileImage(userId: string, imageUrl: string): Promise<User | undefined>;
}
```

**2. Add the implementation in DatabaseStorage class:**
```typescript
async updateUserProfileImage(userId: string, imageUrl: string): Promise<User | undefined> {
  const [updatedUser] = await db
    .update(users)
    .set({ profileImage: imageUrl })
    .where(eq(users.id, userId))
    .returning();
  return updatedUser || undefined;
}
```

---

## 🔌 Step 3: Backend API Endpoint

### Configure multer and create upload endpoint in `server/routes.ts`

**1. Add imports at the top:**
```typescript
import multer from "multer";
import path from "path";
import fs from "fs";
```

**2. Add multer configuration (before `export async function registerRoutes`):**
```typescript
// Create upload directory
const uploadDir = path.join(process.cwd(), "uploads", "profile-images");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const userId = (req.user as any)?.id || 'unknown';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `user-${userId}-${uniqueSuffix}${ext}`);
  }
});

// File validation filter
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

// Create upload middleware
const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: fileFilter
});
```

**3. Add the upload endpoint (inside `registerRoutes` function, with other routes):**
```typescript
app.post("/api/user/profile-image", 
  upload.single('profileImage'),
  async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      const user = req.user as any;
      const userId = user.id;
      const imageUrl = `/uploads/profile-images/${req.file.filename}`;

      // Update database
      await storage.updateUserProfileImage(userId, imageUrl);

      // Delete old image if exists
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
      
      // Cleanup uploaded file on error
      if (req.file) {
        const filePath = path.join(uploadDir, req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      res.status(500).json({ error: "Failed to upload profile image" });
    }
  }
);
```

---

## 🌐 Step 4: Serve Static Files

### Update `server/index.ts` to serve uploaded images

**Add at the top:**
```typescript
import path from "path";
```

**Add after `app.use(express.urlencoded({ extended: false }));`:**
```typescript
// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
```

---

## ⚛️ Step 5: Frontend - ProfileModal Component

### Update `client/src/components/ProfileModal.tsx`

**1. Add imports:**
```typescript
import { useState, useRef } from "react";
import { queryClient } from "@/lib/queryClient";
import ReactCrop, { Crop as CropType, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Crop } from "lucide-react"; // icon for crop dialog
```

**2. Add state variables (inside component):**
```typescript
const [selectedFile, setSelectedFile] = useState<File | null>(null);
const [previewUrl, setPreviewUrl] = useState<string | null>(null);

// Cropping states
const [showCropDialog, setShowCropDialog] = useState(false);
const [imageSrc, setImageSrc] = useState<string>("");
const [crop, setCrop] = useState<CropType>({
  unit: '%',
  width: 80,
  height: 80,
  x: 10,
  y: 10
});
const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
const imgRef = useRef<HTMLImageElement>(null);
```

**3. Add file selection handler:**
```typescript
const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  // Validate file type
  if (!file.type.startsWith('image/')) {
    toast({
      title: "Invalid file type",
      description: "Please select an image file.",
      variant: "destructive",
    });
    return;
  }

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    toast({
      title: "File too large",
      description: "Please select an image smaller than 5MB.",
      variant: "destructive",
    });
    return;
  }

  // Read file and show crop dialog
  const reader = new FileReader();
  reader.onload = () => {
    setImageSrc(reader.result as string);
    setShowCropDialog(true);
  };
  reader.readAsDataURL(file);
};
```

**4. Add image load handler:**
```typescript
const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const { width, height } = e.currentTarget;
  const crop: CropType = {
    unit: '%',
    width: 80,
    height: 80,
    x: 10,
    y: 10
  };
  setCrop(crop);
};
```

**5. Add crop processing function:**
```typescript
const getCroppedImg = (image: HTMLImageElement, crop: PixelCrop): Promise<Blob> => {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas is empty'));
        }
      },
      'image/jpeg',
      0.95
    );
  });
};
```

**6. Add crop confirmation handler:**
```typescript
const handleCropConfirm = async () => {
  if (!completedCrop || !imgRef.current) return;

  try {
    const croppedBlob = await getCroppedImg(imgRef.current, completedCrop);
    const croppedFile = new File([croppedBlob], 'cropped-image.jpg', { type: 'image/jpeg' });
    
    setSelectedFile(croppedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(croppedFile);
    
    setShowCropDialog(false);
    setImageSrc("");
    
    toast({
      title: "Image cropped!",
      description: "Click 'Save Changes' to upload your cropped photo.",
      variant: "success",
    });
  } catch (error) {
    toast({
      title: "Crop failed",
      description: "There was an error cropping your image.",
      variant: "destructive",
    });
  }
};
```

**7. Add upload function:**
```typescript
const uploadProfilePhoto = async () => {
  if (!selectedFile) return;

  try {
    const formData = new FormData();
    formData.append('profileImage', selectedFile);

    const response = await fetch('/api/user/profile-image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error("Upload failed");

    toast({
      title: "Profile Photo Updated!",
      description: "Your profile photo has been successfully updated.",
      variant: "success",
    });

    setPreviewUrl(null);
    setSelectedFile(null);

    // Refresh user data to update Header avatar
    queryClient.invalidateQueries({ queryKey: ['/api/user'] });

  } catch (error) {
    toast({
      title: "Upload failed",
      description: "There was an error uploading your photo.",
      variant: "destructive",
    });
  }
};
```

**8. Add UI elements in the return statement:**

**a) Crop Dialog (add before the main Profile Dialog):**
```typescript
{/* Crop Dialog */}
<Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
  <DialogContent className="w-[95vw] sm:w-full sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col bg-background rounded-md">
    <DialogHeader>
      <DialogTitle className="text-lg font-semibold flex items-center gap-2">
        <Crop className="w-4 h-4" />
        Crop Your Photo
      </DialogTitle>
    </DialogHeader>
    
    <div className="flex-1 overflow-y-auto p-4">
      <div className="flex items-center justify-center">
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={1}
          circularCrop
        >
          <img
            ref={imgRef}
            src={imageSrc}
            alt="Crop preview"
            className="max-h-[45vh] w-auto"
            onLoad={onImageLoad}
          />
        </ReactCrop>
      </div>
    </div>

    <div className="flex flex-col sm:flex-row justify-between gap-2 p-3 border-t">
      <Button
        variant="outline"
        onClick={() => {
          document.getElementById('avatar-upload')?.click();
        }}
        className="w-full sm:w-auto"
      >
        Choose Another Photo
      </Button>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setShowCropDialog(false);
            setImageSrc("");
            setPreviewUrl(null);
            setSelectedFile(null);
          }}
          className="flex-1 sm:flex-none"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleCropConfirm}
          className="flex-1 sm:flex-none"
        >
          Apply Crop
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>
```

**b) Hidden file input (inside main Profile Dialog):**
```typescript
<input
  type="file"
  id="avatar-upload"
  accept="image/*"
  className="hidden"
  onChange={handleFileChange}
/>
```

**c) Camera button on avatar:**
```typescript
<Button
  size="icon"
  variant="secondary"
  className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full shadow-lg"
  onClick={() => document.getElementById('avatar-upload')?.click()}
>
  <Camera className="w-4 h-4" />
</Button>
```

**d) Avatar with preview:**
```typescript
<Avatar className="w-24 h-24 sm:w-32 sm:h-32">
  <AvatarImage src={previewUrl || user.profileImage || undefined} />
  <AvatarFallback>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
</Avatar>
```

**e) Save button that uploads:**
```typescript
<Button
  onClick={async () => {
    if (selectedFile) {
      await uploadProfilePhoto();
    }
    setIsEditing(false);
  }}
>
  Save Changes
</Button>
```

---

## ✅ Testing the Feature

1. **Restart your dev server:**
   ```bash
   npm run dev
   ```

2. **Test the flow:**
   - Click your avatar in header → Profile
   - Click camera button
   - Select an image
   - Crop it
   - Click "Apply Crop"
   - Click "Save Changes"
   - Check that avatar updates everywhere

3. **Verify:**
   - Image saved in `uploads/profile-images/` folder
   - Avatar updates in Header
   - Image persists after page refresh

---

## 🔒 Security Features

✅ **File Type Validation** - Only images allowed (frontend + backend)  
✅ **File Size Limit** - Max 5MB (frontend + backend)  
✅ **Authentication Required** - Must be logged in  
✅ **Unique Filenames** - Prevents collisions with timestamp + random number  
✅ **Old Image Cleanup** - Deletes previous image when uploading new one

---

## 📁 File Structure

```
uploads/
└── profile-images/
    ├── user-123-1730745678-987654.jpg
    └── user-456-1730745890-123456.jpg
```

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| "No file uploaded" error | Check FormData key matches `upload.single('profileImage')` |
| Images not displaying | Ensure static file serving is configured in `server/index.ts` |
| Avatar not updating | Verify `queryClient.invalidateQueries` is called after upload |
| Crop dialog too big | Adjust `max-w-[600px]` and `max-h-[80vh]` values |

---

**Status:** ✅ Complete Implementation  
**Last Updated:** November 4, 2025

---

## 📝 Common Issues & Troubleshooting

---

## �️ Profile Photo Upload Feature

### Overview

The application includes a complete profile photo upload system that allows users to upload and update their profile pictures. This feature includes frontend file handling, backend storage, database updates, and proper validation.

---

### Architecture & Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND (ProfileModal.tsx)               │
├──────────────────────────────────────────────────────────────┤
│  1. User clicks camera button                               │
│  2. File input opens (hidden)                               │
│  3. User selects image                                      │
│  4. handleFileChange() validates file                       │
│     - Check file type (images only)                         │
│     - Check file size (max 5MB)                             │
│  5. Create preview with FileReader API                      │
│  6. Display preview in avatar                               │
│  7. User clicks "Save Changes"                              │
│  8. uploadProfilePhoto() sends file to backend              │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                    BACKEND (routes.ts)                       │
├──────────────────────────────────────────────────────────────┤
│  9. POST /api/user/profile-image receives request          │
│ 10. Multer middleware processes upload                      │
│     - Validates file type (jpeg, jpg, png, gif, webp)      │
│     - Validates file size (max 5MB)                         │
│     - Saves file to disk (uploads/profile-images/)         │
│     - Creates unique filename: user-{id}-{timestamp}.jpg   │
│ 11. Endpoint checks authentication                          │
│ 12. Creates public URL: /uploads/profile-images/...        │
│ 13. Calls storage.updateUserProfileImage()                 │
│ 14. Deletes old profile image file                         │
│ 15. Returns success response with new image URL            │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                   DATABASE (storage.ts)                      │
├──────────────────────────────────────────────────────────────┤
│ 16. updateUserProfileImage(userId, imageUrl)                │
│ 17. UPDATE users SET profileImage = '...' WHERE id = '...' │
│ 18. Returns updated user record                             │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND (ProfileModal.tsx)               │
├──────────────────────────────────────────────────────────────┤
│ 19. Receive success response                                │
│ 20. Show success toast notification                         │
│ 21. Clear preview and selected file state                   │
│ 22. Avatar updates with new image                           │
└──────────────────────────────────────────────────────────────┘
```

---

### Implementation Details

#### 1. **Dependencies Required**

```bash
npm install multer
npm install --save-dev @types/multer
```

**What is Multer?**
- Middleware for handling `multipart/form-data` (file uploads)
- Handles file validation, storage, and naming
- Integrates seamlessly with Express

---

#### 2. **Backend Configuration** (`server/routes.ts`)

**Multer Storage Configuration:**
```typescript
// Create upload directory
const uploadDir = path.join(process.cwd(), "uploads", "profile-images");

// Configure how files are stored
const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Save to uploads/profile-images/
  },
  filename: function (req, file, cb) {
    // Create unique filename: user-123-1699114567890-456789.jpg
    const userId = (req.user as any)?.id || 'unknown';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `user-${userId}-${uniqueSuffix}${ext}`);
  }
});
```

**File Validation:**
```typescript
// Only accept image files
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

// Create upload instance with limits
const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: fileFilter
});
```

**Upload Endpoint:**
```typescript
app.post("/api/user/profile-image", 
  upload.single('profileImage'),  // Multer middleware
  async (req, res) => {
    // 1. Check authentication
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // 2. Verify file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // 3. Create public URL
    const imageUrl = `/uploads/profile-images/${req.file.filename}`;

    // 4. Update database
    await storage.updateUserProfileImage(userId, imageUrl);

    // 5. Delete old image file
    if (user.profileImage && user.profileImage.startsWith('/uploads/')) {
      const oldImagePath = path.join(process.cwd(), user.profileImage);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // 6. Return success
    res.json({
      success: true,
      imageUrl: imageUrl,
      message: "Profile image updated successfully"
    });
  }
);
```

---

#### 3. **Database Layer** (`server/storage.ts`)

**Interface Update:**
```typescript
export interface IStorage {
  // ... existing methods
  updateUserProfileImage(userId: string, imageUrl: string): Promise<User | undefined>;
}
```

**Implementation:**
```typescript
async updateUserProfileImage(userId: string, imageUrl: string): Promise<User | undefined> {
  const [updatedUser] = await db
    .update(users)
    .set({ profileImage: imageUrl })
    .where(eq(users.id, userId))
    .returning();
  return updatedUser || undefined;
}
```

---

#### 4. **Frontend Implementation** (`client/src/components/ProfileModal.tsx`)

**State Management:**
```typescript
const [selectedFile, setSelectedFile] = useState<File | null>(null);
const [previewUrl, setPreviewUrl] = useState<string | null>(null);
const [isUploading, setIsUploading] = useState(false);
```

**File Selection Handler:**
```typescript
const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    toast({
      title: "Invalid file type",
      description: "Please select an image file.",
      variant: "destructive",
    });
    return;
  }
  
  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    toast({
      title: "File too large",
      description: "Please select an image smaller than 5MB.",
      variant: "destructive",
    });
    return;
  }
  
  setSelectedFile(file);
  
  // Create preview
  const reader = new FileReader();
  reader.onloadend = () => {
    setPreviewUrl(reader.result as string);
  };
  reader.readAsDataURL(file);
};
```

**Upload Function:**
```typescript
const uploadProfilePhoto = async () => {
  if (!selectedFile) return;
  
  setIsUploading(true);
  
  try {
    const formData = new FormData();
    formData.append('profileImage', selectedFile);
    
    const response = await fetch('/api/user/profile-image', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) throw new Error('Upload failed');
    
    const data = await response.json();
    
    toast({
      title: "Profile photo updated!",
      description: "Your profile picture has been saved.",
      variant: "success",
    });
    
    setPreviewUrl(null);
    setSelectedFile(null);
    
  } catch (error) {
    toast({
      title: "Upload failed",
      description: "There was an error uploading your photo.",
      variant: "destructive",
    });
  } finally {
    setIsUploading(false);
  }
};
```

**UI Components:**
```typescript
// Hidden file input
<input
  type="file"
  id="avatar-upload"
  accept="image/*"
  className="hidden"
  onChange={handleFileChange}
/>

// Camera button triggers file input
<Button
  size="icon"
  variant="secondary"
  onClick={() => document.getElementById('avatar-upload')?.click()}
>
  <Camera className="w-4 h-4" />
</Button>

// Avatar shows preview or current image
<Avatar>
  <AvatarImage src={previewUrl || user.profileImage || undefined} />
  <AvatarFallback>{getInitials()}</AvatarFallback>
</Avatar>

// Save button uploads photo
<Button
  disabled={isUploading}
  onClick={async () => {
    if (selectedFile) {
      await uploadProfilePhoto();
    }
    setIsEditing(false);
  }}
>
  {isUploading ? "Uploading..." : "Save Changes"}
</Button>
```

---

### File Storage Structure

```
Employee/
├── uploads/                      # Created automatically
│   └── profile-images/          # Profile photos stored here
│       ├── user-123-1699114567890-456789.jpg
│       ├── user-456-1699114589012-123456.png
│       └── ...
├── server/
│   ├── routes.ts               # Upload endpoint
│   └── storage.ts              # Database methods
└── client/
    └── src/
        └── components/
            └── ProfileModal.tsx # Upload UI
```

---

### Validation & Security

#### **File Type Validation**
- **Frontend:** Checks `file.type.startsWith('image/')`
- **Backend:** Multer `fileFilter` validates MIME type and extension
- **Allowed:** JPEG, JPG, PNG, GIF, WebP

#### **File Size Validation**
- **Frontend:** Checks `file.size <= 5MB`
- **Backend:** Multer `limits.fileSize = 5MB`

#### **Authentication**
- Endpoint requires `req.isAuthenticated()`
- Only logged-in users can upload photos

#### **Unique Filenames**
- Format: `user-{userId}-{timestamp}-{random}.{ext}`
- Prevents overwrites and collisions

#### **Cleanup**
- Old profile images are deleted when new ones are uploaded
- Prevents disk space waste

---

### Testing the Feature

#### **Manual Testing Steps:**

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Log in to the application**

3. **Open Profile Modal**
   - Click on your avatar in the header
   - Click "Profile" in the dropdown

4. **Upload a photo**
   - Click the camera button
   - Select an image file (JPEG, PNG, etc.)
   - Verify preview appears
   - Click "Save Changes"

5. **Verify upload**
   - Check success toast appears
   - Avatar updates with new image
   - Check `uploads/profile-images/` folder for new file
   - Refresh page - image should persist

#### **Error Cases to Test:**

- [ ] Upload non-image file → Should show error
- [ ] Upload file > 5MB → Should show error
- [ ] Upload without authentication → Should fail with 401
- [ ] Cancel upload → Should clear preview
- [ ] Multiple uploads → Should delete old images

---

### Common Issues & Troubleshooting

#### Issue: "No file uploaded" error
**Cause:** FormData key doesn't match Multer configuration  
**Solution:** Ensure `formData.append('profileImage', ...)` matches `upload.single('profileImage')`

#### Issue: Images not displaying after upload
**Cause:** Static file serving not configured  
**Solution:** Add to `server/index.ts`:
```typescript
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
```

#### Issue: File size limit exceeded
**Cause:** File is too large  
**Solution:** Either reduce file size or increase limit in multer config

#### Issue: ENOENT error - directory not found
**Cause:** Upload directory doesn't exist  
**Solution:** The code creates it automatically, but ensure proper permissions

---

### API Reference

#### **POST /api/user/profile-image**

**Request:**
```http
POST /api/user/profile-image HTTP/1.1
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="profileImage"; filename="photo.jpg"
Content-Type: image/jpeg

[binary image data]
------WebKitFormBoundary--
```

**Response (Success):**
```json
{
  "success": true,
  "imageUrl": "/uploads/profile-images/user-123-1699114567890-456789.jpg",
  "message": "Profile image updated successfully"
}
```

**Response (Error):**
```json
{
  "error": "Authentication required"
}
```

**Status Codes:**
- `200` - Upload successful
- `400` - No file uploaded or invalid file
- `401` - Not authenticated
- `500` - Server error

---

### Key Lessons Learned

1. **Multer Configuration is Critical**
   - File filters prevent invalid uploads
   - Size limits protect server resources
   - Unique filenames prevent collisions

2. **Frontend Validation Improves UX**
   - Check file type/size before upload
   - Show preview gives user confidence
   - Loading states prevent confusion

3. **Cleanup Prevents Disk Bloat**
   - Delete old images when uploading new ones
   - Handle errors by removing partial uploads
   - Monitor uploads folder size

4. **Security Must Be Multilayered**
   - Authentication required
   - File type validated on both frontend and backend
   - File size limited on both sides
   - Unique filenames prevent path traversal

---

**Feature Status:** ✅ Fully Implemented  
**Last Updated:** November 4, 2025  
**Dependencies:** multer, @types/multer

---

## �📝 Common Issues & Troubleshooting

### Issue: Server won't start on port 5000
**Symptom:** `EADDRINUSE` error  
**Solution:** Another application is using port 5000. Change `PORT` in `.env` or kill the process:
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill it (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Issue: Database connection timeout
**Symptom:** Connection hangs or times out  
**Solution:** 
1. Verify PostgreSQL is running: `Test-NetConnection -ComputerName <host> -Port 5432`
2. Check firewall rules allow port 5432
3. Verify credentials in `.env`
4. Ensure PostgreSQL allows remote connections (check `pg_hba.conf`)

### Issue: Images not loading
**Symptom:** Broken image icons in UI  
**Solution:**
1. Verify `assets/stock_images/` folder exists
2. Check `vite.config.ts` has correct `@assets` alias
3. Restart dev server after config changes

### Issue: TypeScript errors
**Symptom:** Red squiggles or build failures  
**Solution:**
```bash
npm install
npx tsc --noEmit  # Check for type errors
```

---

## 🎯 Key Lessons Learned

### 1. **Platform-Specific Code Requires Conditional Logic**
Code written for Linux (Replit) may not work on Windows. Always check:
- Socket options (`reusePort`, `SO_REUSEADDR`)
- File path separators (`/` vs `\`)
- Case sensitivity (Windows is case-insensitive, Linux is not)

### 2. **Database Drivers Are Not Interchangeable**
Serverless database drivers (Neon, PlanetScale, Supabase) work differently from traditional drivers:
- Use different protocols (WebSocket vs PostgreSQL wire protocol)
- Connect to different ports (443 vs 5432)
- Designed for different environments

**Rule of thumb:**
- Self-hosted database → Use standard driver (`pg`, `mysql2`)
- Cloud serverless database → Use provider's driver

### 3. **Path Aliases Must Be Accurate**
Vite/TypeScript path aliases (`@`, `@assets`) must point to real folders. Typos cause import failures that are:
- Hard to debug (error says "file not found" even if file exists)
- Only caught at runtime (not compile time)
- Require server restart to fix

### 4. **Migration Checklist**
When moving from Replit to local development:
- [ ] Check for platform-specific code (socket options, file paths)
- [ ] Verify all path aliases in `vite.config.ts` and `tsconfig.json`
- [ ] Replace cloud database drivers with standard drivers
- [ ] Update `.env` with local database credentials
- [ ] Test network connectivity to database
- [ ] Run database migrations
- [ ] Verify all assets/files are present in correct locations

---

## 📚 Technology Reference

### Dependencies Changed

| Package | Before | After | Reason |
|---------|--------|-------|--------|
| Database Driver | `@neondatabase/serverless` | `pg` | Switch from cloud to local DB |
| ORM Adapter | `drizzle-orm/neon-serverless` | `drizzle-orm/node-postgres` | Match new driver |
| WebSocket | `ws` | (removed) | Not needed for standard PostgreSQL |

### Files Modified

| File | Changes | Impact |
|------|---------|--------|
| `server/index.ts` | Conditional `reusePort` | Server starts on Windows |
| `server/db.ts` | Switch to standard PostgreSQL driver | Database connection works |
| `vite.config.ts` | Fix `@assets` path alias | Images load correctly |
| `package.json` | Update dependencies | Correct drivers installed |

---

## 🤝 Contributing

If you encounter additional issues when running this application on Windows or other platforms, please document them following this format:

1. **Symptom** - What error/behavior did you see?
2. **Root Cause** - Why did it happen?
3. **Solution** - How did you fix it?
4. **Files Changed** - What files were modified?

---

## 📞 Support

For issues specific to:
- **Database connectivity:** Check PostgreSQL logs and network settings
- **Vite/React issues:** See [Vite documentation](https://vitejs.dev/)
- **Drizzle ORM:** See [Drizzle documentation](https://orm.drizzle.team/)
- **Windows-specific issues:** Check Node.js compatibility and permissions

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Server starts without errors (`npm run dev`)
- [ ] No "Default data initialization skipped" warning
- [ ] Application loads at `http://localhost:5000`
- [ ] Images load correctly on all pages
- [ ] Can register a new user account
- [ ] Can log in with created account
- [ ] Can access protected routes (Dashboard, Team, etc.)
- [ ] Database operations work (checklist CRUD)

---

**Last Updated:** October 14, 2025  
**Migration Environment:** Windows 10/11  
**Original Platform:** Replit (Linux)  
**Status:** ✅ Fully Operational
