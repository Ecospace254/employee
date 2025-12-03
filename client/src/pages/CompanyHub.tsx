import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Newspaper, Megaphone, Users as UsersIcon, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import CreateAnnouncementModal from "@/components/announcements/CreateAnnouncementModal";
import AnnouncementCard from "@/components/announcements/AnnouncementCard";

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
  isSaved: boolean;
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

export default function CompanyHub() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createType, setCreateType] = useState<'news' | 'announcement' | 'introduction'>('announcement');
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check for URL parameters to set active tab
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && ['all', 'news', 'announcement', 'introduction'].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  // Fetch announcements with optional type filter
  const { data: announcements = [], isLoading } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
    queryFn: async () => {
      const response = await fetch(`/api/announcements`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch");
      return response.json();
    },
  });

  // Filter by active tab
  const filteredByTab = activeTab === "all" 
    ? announcements 
    : announcements.filter(a => a.type === activeTab);

  // Filter by search query
  const filteredAnnouncements = filteredByTab.filter((announcement) =>
    announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    announcement.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    announcement.author.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    announcement.author.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get counts for each type
  const newsCount = announcements.filter(a => a.type === 'news').length;
  const announcementsCount = announcements.filter(a => a.type === 'announcement').length;
  const introductionsCount = announcements.filter(a => a.type === 'introduction').length;

  const handleCreate = (type: 'news' | 'announcement' | 'introduction') => {
    setCreateType(type);
    setIsCreateModalOpen(true);
  };

  const getTabIcon = (type: string) => {
    switch (type) {
      case 'news': return <Newspaper className="w-4 h-4" />;
      case 'announcement': return <Megaphone className="w-4 h-4" />;
      case 'meet-us': return <UsersIcon className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white py-6 px-4 sm:px-6 overflow-hidden">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-3xl sm:text-4xl font-bold">Company Hub</h1>
          </div>
          <div className="relative overflow-hidden">
            <p className="text-lg text-purple-100 animate-marquee whitespace-nowrap inline-block">
              Stay connected with news, announcements, and meet our amazing team
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search posts, people, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-10 text-base border focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-accent/50 transition-colors"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto gap-2 bg-transparent p-0">
            <TabsTrigger 
              value="all" 
              className="h-16 flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 rounded-xl data-[state=active]:border-emerald-600 data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:font-bold shadow-md hover:shadow-lg transition-all"
            >
              {getTabIcon('all')}
              <div className="flex flex-col items-start">
                <span className="font-semibold">All Posts</span>
                <span className="text-xs opacity-90">{announcements.length} total</span>
              </div>
            </TabsTrigger>
            
            <TabsTrigger 
              value="news" 
              className="h-16 flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 border-2 rounded-xl data-[state=active]:border-blue-600 data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:font-bold shadow-md hover:shadow-lg transition-all"
            >
              {getTabIcon('news')}
              <div className="flex flex-col items-start">
                <span className="font-semibold">News</span>
                <span className="text-xs opacity-90">{newsCount} posts</span>
              </div>
            </TabsTrigger>
            
            <TabsTrigger 
              value="announcement" 
              className="h-16 flex items-center gap-2 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-2 rounded-xl data-[state=active]:border-teal-600 data-[state=active]:from-teal-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:font-bold shadow-md hover:shadow-lg transition-all"
            >
              {getTabIcon('announcement')}
              <div className="flex flex-col items-start">
                <span className="font-semibold">Announcements</span>
                <span className="text-xs opacity-90">{announcementsCount} posts</span>
              </div>
            </TabsTrigger>
            
            <TabsTrigger 
              value="introduction" 
              className="h-16 flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 rounded-xl data-[state=active]:border-purple-600 data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:font-bold shadow-md hover:shadow-lg transition-all"
            >
              {getTabIcon('meet-us')}
              <div className="flex flex-col items-start">
                <span className="font-semibold">Meet Us</span>
                <span className="text-xs opacity-90">{introductionsCount} posts</span>
              </div>
            </TabsTrigger>
          </TabsList>

          {/* All Tab */}
          <TabsContent value="all" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">All Posts</h2>
              <div className="flex gap-2">
                <Button onClick={() => handleCreate('news')} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  News
                </Button>
                <Button onClick={() => handleCreate('announcement')} className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Announcement
                </Button>
                <Button onClick={() => handleCreate('introduction')} className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Introduction
                </Button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="text-center py-12">Loading...</div>
            ) : filteredAnnouncements.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {searchQuery ? "No posts found matching your search" : "No posts yet"}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAnnouncements.map((announcement) => (
                  <AnnouncementCard key={announcement.id} announcement={announcement} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* News Tab */}
          <TabsContent value="news" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-blue-600">Company News</h2>
              <Button onClick={() => handleCreate('news')} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Create News Post
              </Button>
            </div>
            
            {isLoading ? (
              <div className="text-center py-12">Loading news...</div>
            ) : filteredAnnouncements.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No news posts yet
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAnnouncements.map((announcement) => (
                  <AnnouncementCard key={announcement.id} announcement={announcement} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Announcements Tab */}
          <TabsContent value="announcement" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-teal-600">Important Announcements</h2>
              <Button onClick={() => handleCreate('announcement')} className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Create Announcement
              </Button>
            </div>
            
            {isLoading ? (
              <div className="text-center py-12">Loading announcements...</div>
            ) : filteredAnnouncements.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No announcements yet
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAnnouncements.map((announcement) => (
                  <AnnouncementCard key={announcement.id} announcement={announcement} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Introductions Tab */}
          <TabsContent value="introduction" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-purple-600">Meet Our Team</h2>
              <Button onClick={() => handleCreate('introduction')} className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Introduce Yourself
              </Button>
            </div>
            
            {isLoading ? (
              <div className="text-center py-12">Loading introductions...</div>
            ) : filteredAnnouncements.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No introductions yet. Be the first to share your story!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAnnouncements.map((announcement) => (
                  <AnnouncementCard key={announcement.id} announcement={announcement} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Modal */}
      <CreateAnnouncementModal
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        type={createType}
      />
    </div>
  );
}
