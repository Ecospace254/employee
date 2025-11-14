import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Search, Eye, Bookmark, BookmarkCheck, Calendar, ImageIcon, X } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

// Types for our announcement data
type Announcement = {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
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
    image: null as File | null,
    imagePreview: null as string | null
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
      setNewPost({ title: "", content: "", image: null, imagePreview: null });
      
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

    // Create FormData for multipart/form-data upload
    const formData = new FormData();
    formData.append("title", newPost.title);
    formData.append("content", newPost.content);
    if (newPost.image) {
      formData.append("image", newPost.image);
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
      {/* ============================================ */}
      {/* HEADER SECTION */}
      {/* ============================================ */}
      <div className="mb-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary mb-2">
            News & Announcements
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Stay updated with the latest company news and announcements
          </p>
        </div>

        {/* Search Bar and Create Button - Same row on desktop, stacked on mobile */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          {/* Search Bar */}
          <div className="flex-1 sm:max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search news and announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 w-full"
            />
          </div>

          {/* Create New Post Button - Opens Modal */}
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="gap-2 whitespace-nowrap">
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
                {/* Image Upload Section */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-primary">
                    Image (Optional)
                  </label>
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
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Click to upload image</span>
                      <span className="text-xs text-gray-400 mt-1">Max size: 5MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
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
              {/* News Image (if exists) */}
              {announcement.imageUrl && (
                <div className="w-full h-48 overflow-hidden">
                  <img
                    src={announcement.imageUrl}
                    alt={announcement.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

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
                {/* Bottom Section: View Count and Save Button */}
                <div className="flex items-center justify-between pt-3 border-t">
                  {/* View Count */}
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Eye className="w-4 h-4" />
                    <span className="text-xs">
                      {announcement.viewCount}
                    </span>
                  </div>

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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
