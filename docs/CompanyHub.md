# Company Hub Implementation

## Overview
The Company Hub is a unified platform that replaces the previous News & Announcements page. It consolidates three types of content into a single, beautiful interface:

1. **News** - Company news and updates with images/videos
2. **Announcements** - Important, urgent announcements
3. **Introductions** - Team member introductions with profile photos

## Features

### Content Types
Each content type has its own visual style:

#### News Cards
- **Design**: Blue gradient accent with large image/video support
- **Layout**: Standard card with full media header
- **Media**: Supports image uploads and YouTube embeds
- **Use Case**: Company updates, product launches, achievements

#### Announcement Cards
- **Design**: Orange/amber urgent style, compact layout
- **Layout**: Condensed format emphasizing quick readability
- **Media**: Optional image or link
- **Use Case**: Urgent notifications, policy changes, deadlines

#### Introduction Cards
- **Design**: Purple/pink gradient with prominent profile photo
- **Layout**: Personal style with job title, department, fun facts
- **Media**: Auto-uses user's profile photo (no manual upload)
- **Use Case**: New team member introductions, role changes

### Tab System
- **All Posts**: View all content types together
- **News**: Filter to show only news posts
- **Announcements**: Filter to show only announcements
- **Meet Us**: Filter to show only introductions

Each tab displays the count of posts in that category.

### Interaction Features

#### Like System
- Heart icon button on all posts
- Individual user tracking (no duplicate likes)
- Real-time counter updates
- Optimistic UI updates for smooth experience
- Backend: `announcementLikes` table with UNIQUE constraint

#### Delete Functionality
- Trash icon visible only to post authors
- Confirmation before deletion
- Cascading delete (removes associated likes)
- Immediate UI update on success

#### View Tracking
- Eye icon displays view count
- Tracks engagement metrics

#### Search
- Search across titles, content, and author names
- Works across all tabs
- Real-time filtering

## Database Schema

### Updated `announcements` Table
```typescript
{
  id: string;
  title: string;
  content: string;
  type: 'news' | 'announcement' | 'introduction'; // NEW
  imageUrl: string | null;
  mediaLink: string | null;
  authorId: string;
  viewCount: number;
  likeCount: number; // NEW
  publishedAt: string;
  metadata: string | null; // NEW - JSON for type-specific data
}
```

### New `announcementLikes` Table
```typescript
{
  id: string;
  userId: string;
  announcementId: string;
  likedAt: timestamp;
  UNIQUE(userId, announcementId)
}
```

### Metadata Structure
For introductions:
```json
{
  "funFacts": "Loves hiking, coffee enthusiast, speaks 3 languages"
}
```

## API Endpoints

### GET `/api/announcements?type={type}`
Fetch announcements with optional type filter.

**Query Parameters:**
- `type` (optional): `'news' | 'announcement' | 'introduction'`

**Response:**
```typescript
Array<{
  ...announcement,
  isLiked: boolean, // Whether current user liked it
  isSaved: boolean, // Whether current user saved it
  author: {
    id, firstName, lastName, profileImage, jobTitle, department
  }
}>
```

### POST `/api/announcements`
Create a new post.

**Body (FormData):**
- `title`: string
- `content`: string
- `type`: 'news' | 'announcement' | 'introduction'
- `metadata`: JSON string (optional, for fun facts)
- `image`: File (optional)
- `mediaLink`: string (optional)

### POST `/api/announcements/:id/like`
Like a post.

**Response:** `{ success: true }`

### DELETE `/api/announcements/:id/like`
Unlike a post.

**Response:** `{ success: true }`

### DELETE `/api/announcements/:id`
Delete a post (author only).

**Response:** `{ success: true }`

## Component Architecture

### Pages
- **`CompanyHub.tsx`** - Main page with tabs and search
  - Manages active tab state
  - Handles search filtering
  - Coordinates modal for creating posts

### Components
- **`AnnouncementCard.tsx`** - Adaptive card component
  - Renders different layouts based on `type` prop
  - Handles like/unlike mutations
  - Shows delete button for authors
  - Supports YouTube embeds
  
- **`CreateAnnouncementModal.tsx`** - Smart modal
  - Accepts `type` prop: `'news' | 'announcement' | 'introduction'`
  - Conditional field rendering:
    - News/Announcements: Shows media upload/link tabs
    - Introductions: Shows fun facts field, hides media upload
  - Auto-populates user data for introductions
  - Validates based on type

## Styling Guidelines

### Color Schemes
- **News**: Blue gradient (`from-blue-600 to-purple-600`)
- **Announcements**: Orange/amber (`from-orange-50 to-amber-50`)
- **Introductions**: Purple/pink (`from-purple-500 via-pink-500 to-purple-600`)

### Layout
- News: 2 columns on large screens
- Announcements: Single column (compact)
- Introductions: 3 columns on XL, 2 on MD, 1 on mobile

### Card Features
- Hover shadow animations
- Border accent on left/top based on type
- Gradient backgrounds matching type
- Responsive design for all screen sizes

## Navigation Updates

### Sidebar
- Title changed from "News & Announcements" to "Company Hub"
- Link updated to `/company-hub`
- Description: "Share news, announcements, or introduce yourself"

### App Routing
- New route: `/company-hub` → `CompanyHub.tsx`
- Old route: `/news-announcements` → Still available for backward compatibility

## Migration

### Database Migration
File: `db/migrations/0002_add_announcement_types_and_likes.sql`

Changes:
1. Added `type` column (default 'announcement')
2. Added `like_count` column (default 0)
3. Added `metadata` column (text/JSON)
4. Created `announcement_likes` table
5. Added indexes for performance:
   - `idx_announcements_type`
   - `idx_announcements_published_at`
   - `idx_announcement_likes_user`
   - `idx_announcement_likes_announcement`
6. Updated existing announcements to type='announcement'

Run with: `npm run db:push`

## Usage Examples

### Creating News Post
1. Navigate to Company Hub
2. Click "Create News Post" or use News tab button
3. Upload image or paste YouTube link
4. Enter title and description
5. Click "Publish News"

### Creating Introduction
1. Go to Company Hub or Meet The Team page
2. Click "Introduce Yourself"
3. Enter introduction title (e.g., "Hey, I'm the new Marketing Manager!")
4. Write about yourself
5. Add fun facts (optional)
6. Profile photo is automatically used
7. Click "Share Introduction"

### Liking Posts
- Click heart icon on any post
- Heart fills in when liked
- Counter increments/decrements
- Prevents duplicate likes

### Deleting Posts
- Only visible to post author
- Click trash icon
- Post and associated likes removed

## Future Enhancements

Potential improvements:
- Comments system
- Rich text editor
- Video upload support
- Notification system when someone likes your post
- Analytics dashboard for post engagement
- Pin important announcements
- Archive old posts
- Export company news as newsletter
