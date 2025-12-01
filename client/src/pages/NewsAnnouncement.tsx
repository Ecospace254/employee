import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Eye, Bookmark, BookmarkCheck, Calendar, Link2, ImageIcon, X, Trash2 } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import CreateAnnouncementModal from "@/components/home/CreateAnnouncementModal";

// ============================================
// HELPER FUNCTION: Extract YouTube Video ID from URL
// ============================================
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;

  // Match YouTube URLs: youtube.com/watch?v=... or youtu.be/...
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  return (match && match[2].length === 11) ? match[2] : null;
};

// ============================================
// HELPER FUNCTION: Get YouTube Thumbnail URL
// ============================================
const getYouTubeThumbnail = (url: string): string | null => {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;

  // Use YouTube's high quality thumbnail
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

// ============================================
// HELPER FUNCTION: Get YouTube Embed URL
// ============================================
const getYouTubeEmbedUrl = (url: string): string | null => {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;

  return `https://www.youtube.com/embed/${videoId}`;
};

// ============================================
// HELPER FUNCTION: Check if URL is YouTube
// ============================================
const isYouTubeUrl = (url: string): boolean => {
  if (!url) return false;
  return url.includes('youtube.com') || url.includes('youtu.be');
};

// Types for our announcement data
type Announcement = {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  mediaLink: string | null; // External link (YouTube, blog, etc.)
  authorId: string;
  viewCount: number;
  publishedAt: string;
  isSaved: boolean;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage: string | null;
  };
};

export default function NewsAnnouncement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Form state for creating new announcement
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    mediaType: "image" as "image" | "link", // User choice: upload image OR paste link
    image: null as File | null,
    imagePreview: null as string | null,
    mediaLink: "" // URL for video, blog, article, etc.
  });

  // ============================================
  // FETCH ANNOUNCEMENTS FROM DATABASE
  // ============================================
  const { data: announcements = [], isLoading } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
  });

  // ============================================
  // CREATE NEW ANNOUNCEMENT MUTATION
  // ============================================
  const createAnnouncementMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/announcements", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create announcement");
      }

      return response.json();
    },
    onSuccess: () => {
      // Refresh announcements list
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });

      // Close modal and reset form
      setIsCreateModalOpen(false);
      setNewPost({ title: "", content: "", mediaType: "image", image: null, imagePreview: null, mediaLink: "" });

      toast({
        title: "Success!",
        description: "Your announcement has been posted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // ============================================
  // SAVE/UNSAVE ANNOUNCEMENT MUTATION
  // ============================================
  const toggleSaveMutation = useMutation({
    mutationFn: async ({ id, isSaved }: { id: string; isSaved: boolean }) => {
      const method = isSaved ? "DELETE" : "POST";
      const response = await fetch(`/api/announcements/${id}/save`, {
        method,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to update save status");
      }

      return response.json();
    },
    onSuccess: () => {
      // Refresh announcements to update save status
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
    },
  });

  // ============================================
  // INCREMENT VIEW COUNT (Called when user clicks on announcement)
  // ============================================
  const incrementViewMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/announcements/${id}/view`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to increment views");
      }

      return response.json();
    },
    onSuccess: () => {
      // Refresh to show updated view count
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
    },
  });

  // ============================================
  // DELETE ANNOUNCEMENT MUTATION
  // ============================================
  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/announcements/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        // Check if response is JSON or HTML
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const error = await response.json();
          throw new Error(error.error || error.message || "Failed to delete announcement");
        } else {
          // Server returned HTML instead of JSON (likely a 404 or routing issue)
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Announcement deleted successfully",
      });
      // Refresh announcements list
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // ============================================
  // HANDLE DELETE ANNOUNCEMENT
  // ============================================
  const handleDeleteAnnouncement = (id: string) => {
    if (window.confirm("Are you sure you want to delete this announcement? This action cannot be undone.")) {
      deleteAnnouncementMutation.mutate(id);
    }
  };

  // ============================================
  // HANDLE IMAGE UPLOAD (Preview before submit)
  // ============================================
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setNewPost({ ...newPost, image: file, imagePreview: previewUrl });
    }
  };

  // ============================================
  // REMOVE IMAGE FROM FORM
  // ============================================
  const removeImage = () => {
    if (newPost.imagePreview) {
      URL.revokeObjectURL(newPost.imagePreview); // Clean up memory
    }
    setNewPost({ ...newPost, image: null, imagePreview: null });
  };

  // ============================================
  // SUBMIT NEW ANNOUNCEMENT
  // ============================================
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // Validate media: either image OR link must be provided
    if (newPost.mediaType === "image" && !newPost.image) {
      toast({
        title: "Error",
        description: "Please upload an image",
        variant: "destructive",
      });
      return;
    }

    if (newPost.mediaType === "link" && !newPost.mediaLink.trim()) {
      toast({
        title: "Error",
        description: "Please provide a media link",
        variant: "destructive",
      });
      return;
    }

    // Create FormData for multipart/form-data upload
    const formData = new FormData();
    formData.append("title", newPost.title);
    formData.append("content", newPost.content);

    // Add media based on type
    if (newPost.mediaType === "image" && newPost.image) {
      formData.append("image", newPost.image);
    } else if (newPost.mediaType === "link") {
      formData.append("mediaLink", newPost.mediaLink);
    }

    createAnnouncementMutation.mutate(formData);
  };

  // ============================================
  // FILTER ANNOUNCEMENTS BY SEARCH QUERY
  // ============================================
  const filteredAnnouncements = announcements.filter((announcement) =>
    announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    announcement.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ============================================
  // FORMAT DATE (e.g., "2 hours ago", "3 days ago")
  // ============================================
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* HEADER SECTION - Title, Search, and Button on same row (desktop) */}
      <div className="mb-8">
        {/* Desktop: All in one row | Mobile: Stacked in column */}
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 lg:gap-6">
          {/* Page Title */}
          <div className="lg:flex-shrink-0">
            <h1 className="text-3xl font-bold text-primary whitespace-nowrap">
              News & Announcements
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Stay updated with the latest company news and announcements
            </p>
          </div>

          {/* Create New Post Button - Opens Modal */}
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="gap-2 whitespace-nowrap lg:flex-shrink-0">
                <Plus className="w-4 h-4" />
                Create New Post
              </Button>
            </DialogTrigger>

            {/* ============================================ */}
            {/* CREATE POST MODAL */}
            {/* ============================================ */}
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-primary">Create New Announcement</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleCreatePost} className="space-y-6">
                {/* ============================================ */}
                {/* MEDIA SECTION: Image Upload OR Link */}
                {/* ============================================ */}
                <div>
                  <label className="block text-sm font-medium mb-3 text-primary">
                    Media (Choose one option)
                  </label>

                  <Tabs
                    value={newPost.mediaType}
                    onValueChange={(value) => setNewPost({
                      ...newPost,
                      mediaType: value as "image" | "link",
                      // Clear opposite field when switching tabs
                      image: value === "link" ? null : newPost.image,
                      imagePreview: value === "link" ? null : newPost.imagePreview,
                      mediaLink: value === "image" ? "" : newPost.mediaLink
                    })}
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="image" className="gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Upload Image
                      </TabsTrigger>
                      <TabsTrigger value="link" className="gap-2">
                        <Link2 className="w-4 h-4" />
                        Paste Link
                      </TabsTrigger>
                    </TabsList>

                    {/* TAB 1: Upload Image */}
                    <TabsContent value="image" className="mt-4">
                      {newPost.imagePreview ? (
                        <div className="relative">
                          <img
                            src={newPost.imagePreview}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={removeImage}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">Click to upload image</span>
                          <span className="text-xs text-gray-400 mt-1">JPG, PNG, GIF, WEBP - Max 5MB</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                          />
                        </label>
                      )}
                    </TabsContent>

                    {/* TAB 2: Paste Link */}
                    <TabsContent value="link" className="mt-4">
                      <div className="space-y-3">
                        <Input
                          type="url"
                          placeholder="https://youtube.com/watch?v=..."
                          value={newPost.mediaLink}
                          onChange={(e) => setNewPost({ ...newPost, mediaLink: e.target.value })}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                          📹 Paste a link to: YouTube video, Vimeo, blog article, news site, or any external resource
                        </p>

                        {/* Preview Link - Show YouTube Thumbnail or Generic Link */}
                        {newPost.mediaLink && (
                          <div className="border rounded-lg overflow-hidden">
                            {isYouTubeUrl(newPost.mediaLink) ? (
                              // YouTube Video Preview
                              <div className="space-y-2">
                                <div className="relative w-full h-48 bg-black">
                                  <img
                                    src={getYouTubeThumbnail(newPost.mediaLink) || ''}
                                    alt="YouTube Thumbnail"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      // Fallback if thumbnail fails to load
                                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23000" width="100" height="100"/%3E%3C/svg%3E';
                                    }}
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                      </svg>
                                    </div>
                                  </div>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-800">
                                  <p className="text-xs font-medium text-primary mb-1">YouTube Video</p>
                                  <a
                                    href={newPost.mediaLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline break-all"
                                  >
                                    {newPost.mediaLink}
                                  </a>
                                </div>
                              </div>
                            ) : (
                              // Generic Link Preview
                              <div className="p-3 bg-gray-50 dark:bg-gray-800">
                                <div className="flex items-start gap-3">
                                  <Link2 className="w-10 h-10 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-primary mb-1">External Link</p>
                                    <a
                                      href={newPost.mediaLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
                                    >
                                      {newPost.mediaLink}
                                    </a>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Title Input */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-primary">
                    Title
                  </label>
                  <Input
                    placeholder="Enter announcement title..."
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    required
                  />
                </div>

                {/* Content/Description Input */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-primary">
                    Description
                  </label>
                  <Textarea
                    placeholder="Write your announcement here..."
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    rows={6}
                    required
                  />
                </div>

                {/* Author Info (Auto-filled from logged-in user) */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Posted by:</p>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user?.profileImage || undefined} />
                      <AvatarFallback>
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-primary">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createAnnouncementMutation.isPending}
                  >
                    {createAnnouncementMutation.isPending ? "Posting..." : "Post Announcement"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search Bar - Grows to fill available space */}
        <div className="mt-2 sm:mt-4">
          <div className="flex relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search news and announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 w-full"
            />
          </div>
        </div>

      </div>

      {/* ============================================ */}
      {/* ANNOUNCEMENTS GRID - 4 columns on desktop, 1 on mobile */}
      {/* ============================================ */}
      {isLoading ? (
        <p className="text-center text-muted-foreground py-12">Loading announcements...</p>
      ) : filteredAnnouncements.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          {searchQuery ? "No announcements found matching your search." : "No announcements yet. Click 'Create New Post' to add one."}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAnnouncements.map((announcement) => (
            <Card key={announcement.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
              {/* Media Section: Show Image, YouTube Embed, or Link Preview */}
              {announcement.imageUrl ? (
                // Display uploaded image
                <div className="w-full h-48 overflow-hidden">
                  <img
                    src={announcement.imageUrl}
                    alt={announcement.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : announcement.mediaLink && isYouTubeUrl(announcement.mediaLink) ? (
                // Display YouTube video embed - Full height with proper scaling
                <div className="w-full h-48 relative bg-black overflow-hidden">
                  <iframe
                    src={getYouTubeEmbedUrl(announcement.mediaLink) || ''}
                    title={announcement.title}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : announcement.mediaLink ? (
                // Display link preview with icon for non-YouTube links - Full height
                <a
                  href={announcement.mediaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-48 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 flex flex-col items-center justify-center p-6 border-b hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-colors group"
                >
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <Link2 className="w-16 h-16 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                    <div className="text-center space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">External Resource</p>
                      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
                        {new URL(announcement.mediaLink).hostname}
                      </p>
                    </div>
                  </div>
                </a>
              ) : null}

              <CardHeader className="flex-1">
                {/* Title */}
                <h2 className="text-lg font-bold text-primary mb-2 line-clamp-2">
                  {announcement.title}
                </h2>

                {/* Description - Limit to 3 lines */}
                <p className="text-sm text-foreground leading-relaxed mb-3 line-clamp-3">
                  {announcement.content}
                </p>

                {/* Author Info and Date */}
                <div className="flex items-center gap-2 mb-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={announcement.author.profileImage || undefined} />
                    <AvatarFallback className="text-xs">
                      {announcement.author.firstName[0]}{announcement.author.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs text-primary truncate">
                      {announcement.author.firstName} {announcement.author.lastName}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(announcement.publishedAt)}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Bottom Section: View Count, Save Button, and Delete Button */}
                <div className="flex items-center justify-between pt-3 border-t">
                  {/* View Count */}
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Eye className="w-4 h-4" />
                    <span className="text-xs">
                      {announcement.viewCount}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
                    {/* Save/Unsave Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 h-8 px-2"
                      onClick={() => {
                        // Increment view count when user interacts
                        incrementViewMutation.mutate(announcement.id);
                        // Toggle save status
                        toggleSaveMutation.mutate({
                          id: announcement.id,
                          isSaved: announcement.isSaved
                        });
                      }}
                    >
                      {announcement.isSaved ? (
                        <>
                          <BookmarkCheck className="w-4 h-4 text-primary" />
                          <span className="text-xs">Saved</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-4 h-4" />
                          <span className="text-xs">Save</span>
                        </>
                      )}
                    </Button>

                    {/* Delete Button - Only show if user is the author */}
                    {user?.id === announcement.authorId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                        disabled={deleteAnnouncementMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-xs">Delete</span>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
