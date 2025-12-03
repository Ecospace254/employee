import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ImageIcon, X, Link2 } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

// ============================================
// HELPER FUNCTIONS
// ============================================
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const getYouTubeThumbnail = (url: string): string | null => {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

const isYouTubeUrl = (url: string): boolean => {
  if (!url) return false;
  return url.includes('youtube.com') || url.includes('youtu.be');
};

interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  type?: 'news' | 'announcement' | 'introduction';
}

export default function CreateAnnouncementModal({ isOpen, onOpenChange, type = 'announcement' }: CreateAnnouncementModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Form state
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    mediaType: "image" as "image" | "link",
    image: null as File | null,
    imagePreview: null as string | null,
    mediaLink: "",
    funFacts: ""
  });

  // Create announcement mutation
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
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      onOpenChange(false);
      setNewPost({ title: "", content: "", mediaType: "image", image: null, imagePreview: null, mediaLink: "", funFacts: "" });
      toast({
        title: "Success!",
        description: `Your ${type} has been posted.`,
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

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      setNewPost({ ...newPost, image: file, imagePreview: previewUrl });
    }
  };

  // Remove image
  const removeImage = () => {
    if (newPost.imagePreview) {
      URL.revokeObjectURL(newPost.imagePreview);
    }
    setNewPost({ ...newPost, image: null, imagePreview: null });
  };

  // Submit form
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // Only validate media for news and announcements
    if (type !== 'introduction') {
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
    }

    const formData = new FormData();
    formData.append("title", newPost.title);
    formData.append("content", newPost.content);
    formData.append("type", type);
    
    // Add metadata for introductions
    if (type === 'introduction' && newPost.funFacts) {
      formData.append("metadata", JSON.stringify({ funFacts: newPost.funFacts }));
    }
    
    if (newPost.mediaType === "image" && newPost.image) {
      formData.append("image", newPost.image);
    } else if (newPost.mediaType === "link" && newPost.mediaLink) {
      formData.append("mediaLink", newPost.mediaLink);
    }

    createAnnouncementMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary">
            {type === 'news' && 'Create News Post'}
            {type === 'announcement' && 'Create Announcement'}
            {type === 'introduction' && 'Introduce Yourself'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleCreatePost} className="space-y-6">
          {/* Media Section - Only for news and announcements */}
          {type !== 'introduction' && (
            <div>
              <label className="block text-sm font-medium mb-3 text-primary">
                Media (Choose one option)
              </label>
            
            <Tabs 
              value={newPost.mediaType} 
              onValueChange={(value) => setNewPost({ 
                ...newPost, 
                mediaType: value as "image" | "link",
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

              {/* Upload Image Tab */}
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

              {/* Paste Link Tab */}
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
                  
                  {/* Preview Link */}
                  {newPost.mediaLink && (
                    <div className="border rounded-lg overflow-hidden">
                      {isYouTubeUrl(newPost.mediaLink) ? (
                        <div className="space-y-2">
                          <div className="relative w-full h-48 bg-black">
                            <img 
                              src={getYouTubeThumbnail(newPost.mediaLink) || ''} 
                              alt="YouTube Thumbnail"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23000" width="100" height="100"/%3E%3C/svg%3E';
                              }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z"/>
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
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2 text-primary">
              {type === 'introduction' ? 'Introduction Title' : 'Title'}
            </label>
            <Input
              placeholder={
                type === 'introduction' 
                  ? 'e.g., "Hey, I\'m the new Marketing Manager!"' 
                  : type === 'news'
                  ? 'e.g., "Company Launches New Product"'
                  : 'Enter announcement title...'
              }
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2 text-primary">
              {type === 'introduction' ? 'About You' : 'Description'}
            </label>
            <Textarea
              placeholder={
                type === 'introduction'
                  ? 'Tell us about yourself, your role, and what you\'re excited about...'
                  : type === 'news'
                  ? 'Share the news story...'
                  : 'Write your announcement here...'
              }
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              rows={6}
              required
            />
          </div>

          {/* Fun Facts - Only for introductions */}
          {type === 'introduction' && (
            <div>
              <label className="block text-sm font-medium mb-2 text-primary">
                Fun Facts (Optional)
              </label>
              <Textarea
                placeholder="Share some fun facts about yourself! Hobbies, interests, favorites..."
                value={newPost.funFacts}
                onChange={(e) => setNewPost({ ...newPost, funFacts: e.target.value })}
                rows={4}
              />
            </div>
          )}

          {/* Author Info */}
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
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createAnnouncementMutation.isPending}
            >
              {createAnnouncementMutation.isPending 
                ? "Posting..." 
                : type === 'introduction' 
                ? "Share Introduction"
                : type === 'news'
                ? "Publish News"
                : "Post Announcement"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
