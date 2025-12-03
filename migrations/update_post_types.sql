-- Update existing posts to have correct types
-- Run this SQL in your database to fix the types of existing posts

-- Example: Update posts with images/videos to be 'news'
-- UPDATE announcements 
-- SET type = 'news' 
-- WHERE (image_url IS NOT NULL OR media_link IS NOT NULL) 
-- AND type = 'announcement';

-- Or update specific posts by ID:
-- UPDATE announcements SET type = 'news' WHERE id = 'YOUR_POST_ID_HERE';

-- To see all your current announcements:
SELECT id, title, type, image_url, media_link, published_at 
FROM announcements 
ORDER BY published_at DESC;
