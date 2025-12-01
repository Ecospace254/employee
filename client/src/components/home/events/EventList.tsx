import { EventCard } from "./EventCard";
import type { EventWithDetails } from "@/hooks/use-events";
import { useEvents } from "@/hooks/use-events";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

interface EventListProps {
  events?: EventWithDetails[];
  isLoading?: boolean;
  onEventClick?: (event: EventWithDetails) => void;
  showActions?: boolean;
  emptyMessage?: string;
}

export function EventList({ 
  events, 
  isLoading, 
  onEventClick,
  showActions = true,
  emptyMessage = "No events found"
}: EventListProps) {
  const { user } = useAuth();
  const { updateRSVP } = useEvents();

  const handleRSVP = (eventId: string, status: "accepted" | "declined" | "maybe") => {
    if (!user) return;
    
    updateRSVP.mutate(
      { eventId, userId: user.id, status },
      {
        onSuccess: () => {
          console.log("RSVP updated successfully");
        },
        onError: (error) => {
          console.error("Failed to update RSVP:", error);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground text-lg">{emptyMessage}</p>
        <p className="text-sm text-muted-foreground mt-2">
          Check back later or create a new event
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          onClick={() => onEventClick?.(event)}
          onRSVP={(status) => handleRSVP(event.id, status)}
          showActions={showActions}
        />
      ))}
    </div>
  );
}
