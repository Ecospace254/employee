import { useState } from "react";
import { useEvents } from "@/hooks/use-events";
import { useAuth } from "@/hooks/use-auth";
import { EventsSidebar } from "@/components/home/events/EventsSidebar";
import { EventsHero } from "@/components/home/events/EventsHero";
import { EventsActionCards } from "@/components/home/events/EventsActionCards";
import { TodaysMeetings } from "@/components/home/events/TodaysMeetings";
import { MeetingCard } from "@/components/home/events/MeetingCard";
import { CreateEventDialog } from "@/components/home/events/CreateEventDialog";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isSameDay } from "date-fns";
import type { EventWithDetails } from "@/hooks/use-events";

export default function Events() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [activeSection, setActiveSection] = useState<"home" | "upcoming" | "previous" | "recordings">("home");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const today = new Date();

  // Fetch all events
  const { events: allEvents, isLoading } = useEvents();

  // Filter events
  const upcomingEvents = allEvents?.filter(event => 
    new Date(event.startTime) >= new Date()
  ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()) || [];

  const previousEvents = allEvents?.filter(event => 
    new Date(event.endTime) < new Date()
  ).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()) || [];

  const todaysMeetings = upcomingEvents.filter(event =>
    isSameDay(new Date(event.startTime), today)
  );

  const recordedEvents = allEvents?.filter(event => 
    event.recordingUrl
  ).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()) || [];

  // Get next upcoming meeting for hero badge
  const nextUpcomingMeeting = upcomingEvents[0];

  // Handlers
  const handleNewMeeting = () => {
    setShowCreateDialog(true);
  };

  const handleJoinMeeting = () => {
    const link = prompt("Enter meeting invitation link:");
    if (link) {
      window.open(link, "_blank");
    }
  };

  const handleScheduleMeeting = () => {
    setShowCreateDialog(true);
  };

  const handleViewRecordings = () => {
    setActiveSection("recordings");
  };

  const handleStartMeeting = (event: EventWithDetails) => {
    if (event.meetingLink) {
      window.open(event.meetingLink, "_blank");
    }
  };

  const handleDeleteMeeting = async (event: EventWithDetails) => {
    if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
      try {
        const response = await fetch(`/api/events/${event.id}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to delete event");
        }

        toast({
          title: "Meeting deleted",
          description: "The meeting has been successfully deleted",
        });

        // Refresh the events list
        window.location.reload();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete meeting",
          variant: "destructive",
        });
      }
    }
  };

  // Render content based on active section
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    switch (activeSection) {
      case "home":
        return (
          <div className="space-y-8">
            <EventsHero upcomingMeeting={nextUpcomingMeeting} />
            <EventsActionCards
              onNewMeeting={handleNewMeeting}
              onJoinMeeting={handleJoinMeeting}
              onScheduleMeeting={handleScheduleMeeting}
              onViewRecordings={handleViewRecordings}
            />
            <TodaysMeetings
              meetings={todaysMeetings}
              onSeeMore={() => setActiveSection("upcoming")}
              onStartMeeting={handleStartMeeting}
              onDeleteMeeting={handleDeleteMeeting}
              currentUserId={user?.id}
            />
          </div>
        );

      case "upcoming":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Upcoming Meetings</h2>
              <p className="text-muted-foreground">
                {upcomingEvents.length} meeting{upcomingEvents.length !== 1 ? "s" : ""} scheduled
              </p>
            </div>
            
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <p className="text-lg">No upcoming meetings scheduled</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {upcomingEvents.map((event) => (
                  <MeetingCard
                    key={event.id}
                    event={event}
                    onStart={handleStartMeeting}
                    onDelete={handleDeleteMeeting}
                    currentUserId={user?.id}
                  />
                ))}
              </div>
            )}
          </div>
        );

      case "previous":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Previous Meetings</h2>
              <p className="text-muted-foreground">
                {previousEvents.length} past meeting{previousEvents.length !== 1 ? "s" : ""}
              </p>
            </div>
            
            {previousEvents.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <p className="text-lg">No previous meetings</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {previousEvents.map((event) => (
                  <MeetingCard
                    key={event.id}
                    event={event}
                    onStart={handleStartMeeting}
                    onDelete={handleDeleteMeeting}
                    currentUserId={user?.id}
                  />
                ))}
              </div>
            )}
          </div>
        );

      case "recordings":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Meeting Recordings</h2>
              <p className="text-muted-foreground">
                {recordedEvents.length} recording{recordedEvents.length !== 1 ? "s" : ""} available
              </p>
            </div>
            
            {recordedEvents.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <p className="text-lg">No recordings available</p>
                <p className="text-sm mt-2">Recordings will appear here after meetings are recorded</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recordedEvents.map((event) => (
                  <MeetingCard
                    key={event.id}
                    event={event}
                    variant="recording"
                    onStart={handleStartMeeting}
                    currentUserId={user?.id}
                  />
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-background dark:bg-slate-950">
      {/* Mobile Menu Button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden bg-background/80 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      )}

      {/* Sidebar */}
      <EventsSidebar
        activeSection={activeSection}
        onSectionChange={(section) => {
          setActiveSection(section);
          if (isMobile) {
            setIsSidebarOpen(false);
          }
        }}
        onCreateMeeting={() => {
          setShowCreateDialog(true);
          if (isMobile) {
            setIsSidebarOpen(false);
          }
        }}
        isOpen={isMobile ? isSidebarOpen : true}
        onClose={() => setIsSidebarOpen(false)}
        isMobile={isMobile}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="px-4 md:px-6 py-8 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Create Meeting Dialog */}
      <CreateEventDialog
        isOpen={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}