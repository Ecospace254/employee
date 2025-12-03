import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExpandableText } from "@/components/ui/expandable-text";
import {
  Heart,
  Trash2,
  Eye,
  Calendar,
  Briefcase,
  MapPin,
  ExternalLink,
  Play,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

type Announcement = {
  id: string;
  title: string;
  content: string;
  type: 'news' | 'announcement' | 'introduction';
  imageUrl: string | null;
  mediaLink: string | null;
  authorId: string;
  viewCount: number;
  likeCount: number;
  publishedAt: string;
  metadata: string | null;
  isLiked: boolean;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage: string | null;
    jobTitle?: string;
    department?: string;
  };
};

interface Props {
  announcement: Announcement;
  compact?: boolean;
}

export default function AnnouncementCard({ announcement, compact = false }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [imageError, setImageError] = useState(false);

  const isAuthor = user?.id === announcement.authorId;

  // Parse metadata for introductions
  const metadata = announcement.metadata ? JSON.parse(announcement.metadata) : null;

  // YouTube helpers
  const getYouTubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/,
      /youtube\.com\/shorts\/([^&?/]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const isYouTubeUrl = (url: string): boolean => {
    return /(?:youtube\.com|youtu\.be)/.test(url);
  };

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      const method = announcement.isLiked ? "DELETE" : "POST";
      const response = await fetch(`/api/announcements/${announcement.id}/like`, {
        method,
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to update like");
      return response.json();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["/api/announcements"] });
      const previousData = queryClient.getQueryData(["/api/announcements"]);
      queryClient.setQueryData(["/api/announcements"], (old: Announcement[] = []) =>
        old.map((a) =>
          a.id === announcement.id
            ? {
                ...a,
                isLiked: !a.isLiked,
                likeCount: a.isLiked ? a.likeCount - 1 : a.likeCount + 1,
              }
            : a
        )
      );
      return { previousData };
    },
    onError: (error, variables, context: any) => {
      queryClient.setQueryData(["/api/announcements"], context.previousData);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/announcements/${announcement.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    },
  });

  // News Card - Standard with image/video
  if (announcement.type === 'news' && !compact) {
    return (
      <Card className="overflow-hidden hover:shadow-xl transition-all border-l-4 border-l-blue-600 bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-800 dark:to-blue-900/10">
        {/* Image/Video Header */}
        {announcement.mediaLink && isYouTubeUrl(announcement.mediaLink) ? (
          <div className="relative aspect-video bg-slate-900">
            <iframe
              title={announcement.title}
              src={`https://www.youtube.com/embed/${getYouTubeVideoId(announcement.mediaLink)}`}
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        ) : announcement.imageUrl && !imageError ? (
          <div className="relative aspect-video bg-slate-100 dark:bg-slate-900">
            <img
              src={announcement.imageUrl}
              alt={announcement.title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
            <div className="absolute top-4 left-4">
              <Badge className="bg-blue-600 text-white">
                <Sparkles className="w-3 h-3 mr-1" />
                News
              </Badge>
            </div>
          </div>
        ) : (
          <div className="relative aspect-video bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <Sparkles className="w-20 h-20 text-white opacity-20" />
            <div className="absolute top-4 left-4">
              <Badge className="bg-white/20 text-white border-white/40">
                News
              </Badge>
            </div>
          </div>
        )}

        <CardHeader className="space-y-4">
          <div className="flex-1">
            <ExpandableText
              text={announcement.title}
              maxLength={80}
              className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-2 leading-tight"
            />
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8 border-2 border-blue-200">
                  <AvatarImage src={announcement.author.profileImage || ""} />
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    {announcement.author.firstName[0]}{announcement.author.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {announcement.author.firstName} {announcement.author.lastName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(announcement.publishedAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Eye className="w-4 h-4" />
                <span>{announcement.viewCount}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <ExpandableText
            text={announcement.content}
            maxLength={200}
            className="text-base text-foreground leading-relaxed"
          />
          {announcement.mediaLink && !isYouTubeUrl(announcement.mediaLink) && (
            <a
              href={announcement.mediaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              View Link
            </a>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t bg-blue-50/50 dark:bg-blue-900/10">
          <Button
            variant={announcement.isLiked ? "default" : "outline"}
            size="sm"
            onClick={() => likeMutation.mutate()}
            className={announcement.isLiked ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            <Heart className={`w-4 h-4 mr-2 ${announcement.isLiked ? "fill-current" : ""}`} />
            {announcement.likeCount}
          </Button>
          {isAuthor && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteMutation.mutate()}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }

  // Announcement Card - Compact urgent style
  if (announcement.type === 'announcement') {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-all border-l-4 border-l-teal-600 bg-gradient-to-r from-teal-50 to-cyan-50/50 dark:from-teal-900/20 dark:to-cyan-900/10">
        {/* Optional Media Header for Announcements */}
        {announcement.mediaLink && isYouTubeUrl(announcement.mediaLink) ? (
          <div className="relative aspect-video bg-slate-900">
            <iframe
              title={announcement.title}
              src={`https://www.youtube.com/embed/${getYouTubeVideoId(announcement.mediaLink)}`}
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        ) : announcement.imageUrl && !imageError ? (
          <div className="relative aspect-video bg-slate-100 dark:bg-slate-900">
            <img
              src={announcement.imageUrl}
              alt={announcement.title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
            <div className="absolute top-4 left-4">
              <Badge className="bg-teal-600 text-white">
                <AlertCircle className="w-3 h-3 mr-1" />
                Announcement
              </Badge>
            </div>
          </div>
        ) : null}
        
        <CardHeader className="pb-3">
          <div className="flex-1">
            {!announcement.imageUrl && (
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-teal-600 text-white">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Announcement
                </Badge>
              </div>
            )}
            <ExpandableText
              text={announcement.title}
              maxLength={60}
              className="text-xl font-bold text-teal-900 dark:text-teal-100"
            />
          </div>
        </CardHeader>

        <CardContent className="pt-0 pb-3">
          <ExpandableText
            text={announcement.content}
            maxLength={150}
            className="text-sm text-foreground leading-relaxed mb-3"
          />
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={announcement.author.profileImage || ""} />
                <AvatarFallback className="bg-teal-100 text-teal-700 text-xs">
                  {announcement.author.firstName[0]}{announcement.author.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-xs font-medium">
                  {announcement.author.firstName} {announcement.author.lastName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(announcement.publishedAt), { addSuffix: true })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Eye className="w-3 h-3" />
              <span>{announcement.viewCount}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-3 flex items-center justify-between border-t bg-teal-50/50 dark:bg-teal-900/10">
          <Button
            variant={announcement.isLiked ? "default" : "outline"}
            size="sm"
            onClick={() => likeMutation.mutate()}
            className={announcement.isLiked ? "bg-teal-600 hover:bg-teal-700" : ""}
          >
            <Heart className={`w-4 h-4 mr-2 ${announcement.isLiked ? "fill-current" : ""}`} />
            {announcement.likeCount}
          </Button>
          {isAuthor && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteMutation.mutate()}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }

  // Introduction Card - Personal with profile photo
  if (announcement.type === 'introduction') {
    return (
      <Card className="overflow-hidden hover:shadow-xl transition-all border-2 border-purple-200 bg-gradient-to-br from-white via-purple-50/30 to-pink-50/20 dark:from-slate-800 dark:via-purple-900/10 dark:to-pink-900/5">
        {/* Profile Header */}
        <div className="relative h-32 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600">
          <div className="absolute -bottom-12 left-6">
            <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
              <AvatarImage src={announcement.author.profileImage || ""} />
              <AvatarFallback className="bg-purple-100 text-purple-700 text-2xl">
                {announcement.author.firstName[0]}{announcement.author.lastName[0]}
              </AvatarFallback>
            </Avatar>
          </div>
          {isAuthor && (
            <div className="absolute top-4 right-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteMutation.mutate()}
                className="bg-white/20 hover:bg-white/30 text-white"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        <CardHeader className="pt-16 pb-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {announcement.author.firstName} {announcement.author.lastName}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(announcement.publishedAt), { addSuffix: true })}
                </p>
                {announcement.author.jobTitle && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Briefcase className="w-4 h-4" />
                    <span>{announcement.author.jobTitle}</span>
                  </div>
                )}
                {announcement.author.department && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>{announcement.author.department}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge className="bg-purple-600 text-white">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Introduction
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Eye className="w-4 h-4" />
                  <span>{announcement.viewCount}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div>
              <ExpandableText
                text={announcement.title}
                maxLength={70}
                className="font-semibold text-purple-900 dark:text-purple-100 mb-2"
              />
              <ExpandableText
                text={announcement.content}
                maxLength={180}
                className="text-sm text-foreground leading-relaxed"
              />
            </div>

            {metadata?.funFacts && (
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <h5 className="font-semibold text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Fun Facts
                </h5>
                <ExpandableText
                  text={metadata.funFacts}
                  maxLength={120}
                  className="text-sm text-foreground"
                />
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t bg-purple-50/50 dark:bg-purple-900/10">
          <Button
            variant={announcement.isLiked ? "default" : "outline"}
            size="sm"
            onClick={() => likeMutation.mutate()}
            className={announcement.isLiked ? "bg-purple-600 hover:bg-purple-700" : ""}
          >
            <Heart className={`w-4 h-4 mr-2 ${announcement.isLiked ? "fill-current" : ""}`} />
            {announcement.likeCount}
          </Button>
          {isAuthor && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteMutation.mutate()}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }

  return null;
}
