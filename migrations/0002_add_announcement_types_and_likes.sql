-- sql.dialect: postgres
-- Add type column to announcements table
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'announcement';

-- Add likeCount column to announcements table
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;

-- Add metadata column for type-specific data (JSON)
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS metadata TEXT;

-- Create announcement_likes table
CREATE TABLE IF NOT EXISTS announcement_likes (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  announcement_id VARCHAR NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  liked_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, announcement_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_announcements_type ON announcements(type);
CREATE INDEX IF NOT EXISTS idx_announcements_published_at ON announcements(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcement_likes_user ON announcement_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_announcement_likes_announcement ON announcement_likes(announcement_id);

-- Update existing announcements to have default type
UPDATE announcements SET type = 'announcement' WHERE type IS NULL;
