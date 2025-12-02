import { Button } from "@/components/ui/button";
import { MeetingCard } from "./MeetingCard";
import { ArrowRight } from "lucide-react";
import type { EventWithDetails } from "@/hooks/use-events";

interface TodaysMeetingsProps {
  meetings: EventWithDetails[];
  onSeeMore: () => void;
  onStartMeeting?: (event: EventWithDetails) => void;
  onDeleteMeeting?: (event: EventWithDetails) => void;
  currentUserId?: string;
}

export function TodaysMeetings({
  meetings,
  onSeeMore,
  onStartMeeting,
  onDeleteMeeting,
  currentUserId,
}: TodaysMeetingsProps) {
  // Show only first 2 meetings
  const displayedMeetings = meetings.slice(0, 2);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Today's Upcoming Meetings</h2>
        <Button
          variant="ghost"
          className="text-primary hover:text-primary/90"
          onClick={onSeeMore}
        >
          See More
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {displayedMeetings.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">No meetings today.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {displayedMeetings.map((meeting) => (
            <MeetingCard
              key={meeting.id}
              event={meeting}
              onStart={onStartMeeting}
              onDelete={onDeleteMeeting}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
