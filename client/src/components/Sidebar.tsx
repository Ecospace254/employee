import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar } from "lucide-react";
import { SiLinkedin, SiFacebook } from "react-icons/si";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import managerImage from "@assets/generated_images/Marketing_manager_headshot_78fdbb6a.png";
import directorImage from "@assets/generated_images/Director_professional_headshot_35910231.png";
import CreateAnnouncementModal from "@/components/CreateAnnouncementModal";
import { useAuth } from "@/hooks/use-auth";
import { useUpcomingEvents } from "@/hooks/use-events";
import { CreateEventDialog } from "@/components/events/CreateEventDialog";

// Type for announcement from API
type Announcement = {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  mediaLink: string | null;
  authorId: string;
  viewCount: number;
  publishedAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage: string | null;
  };
};

// Helper function to format date
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

export default function Sidebar() {
  const [, setLocation] = useLocation();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const { user } = useAuth();

  // Fetch announcements from API
  const { data: announcements = [] } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
  });

  // Get the latest announcement (most recent)
  const latestAnnouncement = announcements.length > 0 ? announcements[0] : null;

  // Fetch upcoming events (only if user is authenticated)
  const { data: events = [], isLoading: eventsLoading, isError: eventsError } = useUpcomingEvents(3);

  const [teamMembers] = useState([
    {
      id: "1",
      name: "Megan Bowen",
      role: "Marketing manager",
      image: managerImage
    },
    {
      id: "2",
      name: "Lynne Robbins",
      role: "Planner",
      image: undefined
    },
    {
      id: "3",
      name: "Lee Gu",
      role: "Director",
      image: directorImage
    },
    {
      id: "4",
      name: "Emily Braun",
      role: "Budget analyst",
      image: undefined
    }
  ]);

  const handleAddNews = () => {
    // Open create announcement modal
    setIsCreateModalOpen(true);
  };

  const handleAddEvent = () => {
    setIsCreateEventOpen(true);
  };

  const handleCreateEvent = () => {
    setIsCreateEventOpen(true);
  };

  const handleSeeAllEvents = () => {
    setLocation("/events");
  };

  return (
    <div className="w-full space-y-4 lg:space-y-6">
      {/* News & Announcements */}
      <Card className="dark:bg-slate-800">
        <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-4">
          <h3 className="text-lg font-semibold" data-testid="text-news-title">News & Announcements</h3>
          <Button
            onClick={() => setLocation("/news-announcements")}
            variant="ghost"
            size="sm"
            className="h-auto p-1 text-primary text-sm"
            data-testid="button-add-news"
          >
            See more
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Create Action Card */}
          <div 
            className="flex gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors"
            onClick={handleAddNews}
          >
            <div className="w-12 h-12 bg-primary rounded flex items-center justify-center flex-shrink-0">
              <Plus className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-foreground">
                Create a news post
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Keep your audience informed
              </p>
            </div>
          </div>

          {/* Latest Announcement Card */}
          {latestAnnouncement && (
            <div 
              className="flex gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors"
              onClick={() => setLocation("/news-announcements")}
            >
              <Avatar className="w-12 h-12 flex-shrink-0">
                {latestAnnouncement.author.profileImage ? (
                  <AvatarImage src={latestAnnouncement.author.profileImage} alt={latestAnnouncement.author.firstName} />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {latestAnnouncement.author.firstName[0]}{latestAnnouncement.author.lastName[0]}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground truncate">
                  {latestAnnouncement.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {latestAnnouncement.content}
                </p>
                <div className="text-xs text-muted-foreground mt-1">
                  {latestAnnouncement.author.firstName} {latestAnnouncement.author.lastName} • {formatDate(latestAnnouncement.publishedAt)}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card className="dark:bg-slate-800">
        <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-4">
          <h3 className="text-lg font-semibold" data-testid="text-events-title">Upcoming Events</h3>
          <Button
            onClick={handleSeeAllEvents}
            variant="ghost"
            size="sm"
            className="text-primary text-sm"
            data-testid="button-see-all-events"
          >
            See more
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <CreateEventDialog>
            <Button
              variant="default"
              size="sm"
              data-testid="button-create-event"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create a new event
            </Button>
          </CreateEventDialog>

          {eventsLoading ? (
            <div className="bg-muted p-3 rounded-lg animate-pulse">
              <p className="text-xs text-muted-foreground text-center">
                Loading...
              </p>
            </div>
          ) : events && events.length > 0 ? (
            events.map((event: any) => {
              const startDate = new Date(event.startTime);
              const endDate = new Date(event.endTime);
              const dayOfMonth = format(startDate, "dd");
              const dayOfWeek = format(startDate, "EEEE");
              const timeRange = `${format(startDate, "h:mm a")} - ${format(endDate, "h:mm a")}`;

              return (
                <div 
                  key={event.id} 
                  className="flex gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors"
                  onClick={() => setLocation("/events")}
                >
                  <div className="text-center flex-shrink-0">
                    <div className="text-xs text-muted-foreground">Day</div>
                    <div className="text-lg font-semibold text-foreground">{dayOfMonth}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground truncate" data-testid={`text-event-${event.id}-title`}>
                      {event.title}
                    </h4>
                    <p className="text-xs text-muted-foreground" data-testid={`text-event-${event.id}-date`}>
                      {dayOfWeek} {timeRange}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-xs text-muted-foreground text-center">
                No upcoming events
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meet the onboarding team */}
      <Card className="dark:bg-slate-800">
        <CardHeader>
          <h3 className="text-lg font-semibold" data-testid="text-team-title">Meet the onboarding team</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          {teamMembers.map((member) => (
            <div key={member.id} className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={member.image} />
                <AvatarFallback className="bg-muted">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground" data-testid={`text-member-${member.id}-name`}>
                  {member.name}
                </h4>
                <p className="text-xs text-muted-foreground" data-testid={`text-member-${member.id}-role`}>
                  {member.role}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card className="dark:bg-slate-800">
        <CardHeader>
          <h3 className="text-lg font-semibold" data-testid="text-links-title">Quick Links</h3>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-primary"
            data-testid="link-linkedin"
          >
            <SiLinkedin className="w-4 h-4 mr-2" />
            LinkedIn
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-primary"
            data-testid="link-facebook"
          >
            <SiFacebook className="w-4 h-4 mr-2" />
            Facebook
          </Button>
        </CardContent>
      </Card>

      {/* Create Announcement Modal */}
      <CreateAnnouncementModal 
        isOpen={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen} 
      />
    </div>
  );
}