import { format } from "date-fns";
import { Calendar, Clock, Copy, Play, Video, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { EventWithDetails } from "@/hooks/use-events";

interface MeetingCardProps {
  event: EventWithDetails;
  onStart?: (event: EventWithDetails) => void;
  onDelete?: (event: EventWithDetails) => void;
  currentUserId?: string;
  variant?: "default" | "recording";
}

export function MeetingCard({ event, onStart, onDelete, currentUserId, variant = "default" }: MeetingCardProps) {
  const { toast } = useToast();

  // Get first 4 participants
  const visibleParticipants = event.participants?.slice(0, 4) || [];
  const remainingCount = (event.participants?.length || 0) - 4;

  // Check if current user is organizer
  const isOrganizer = currentUserId === event.organizerId;
  const isPast = new Date(event.endTime) < new Date();

  const handleCopyInvitation = () => {
    const inviteText = `Join "${event.title}"\n\nDate: ${format(new Date(event.startTime), "EEEE, MMMM d, yyyy")}\nTime: ${format(new Date(event.startTime), "h:mm a")} - ${format(new Date(event.endTime), "h:mm a")}\n\n${event.meetingLink || "No meeting link provided"}`;
    
    navigator.clipboard.writeText(inviteText);
    toast({
      title: "Invitation copied!",
      description: "Meeting invitation link copied to clipboard",
    });
  };

  const handleStartMeeting = () => {
    if (event.meetingLink) {
      window.open(event.meetingLink, "_blank");
    }
    onStart?.(event);
  };

  const handleDelete = () => {
    if (isOrganizer && onDelete) {
      onDelete(event);
    }
  };

  // Get event type icon
  const getEventIcon = () => {
    switch (event.eventType) {
      case "training":
        return <Video className="h-4 w-4" />;
      case "1on1":
        return <Calendar className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  // Get event type color
  const getEventColor = () => {
    switch (event.eventType) {
      case "training":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "team_meeting":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
      case "1on1":
        return "bg-teal-500/10 text-teal-600 dark:text-teal-400";
      default:
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
    }
  };

  if (variant === "recording") {
    return (
      <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 dark:bg-slate-900/50 overflow-hidden">
        <div className="relative aspect-video bg-gradient-to-br from-purple-500/20 to-blue-500/20">
          {event.recordingThumbnail ? (
            <img 
              src={event.recordingThumbnail} 
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Video className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button size="lg" className="rounded-full" onClick={handleStartMeeting}>
              <Play className="h-5 w-5 mr-2" />
              Watch Recording
            </Button>
          </div>
          {event.recordingDuration && (
            <Badge className="absolute bottom-2 right-2 bg-black/60">
              {event.recordingDuration} min
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-base mb-2 line-clamp-1">{event.title}</h3>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            {format(new Date(event.startTime), "MMM d, yyyy")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 dark:bg-slate-900/50 relative overflow-hidden">
      {/* Event type indicator */}
      <div className={`absolute top-0 left-0 w-1 h-full ${event.eventType === 'training' ? 'bg-blue-500' : event.eventType === 'team_meeting' ? 'bg-emerald-500' : event.eventType === '1on1' ? 'bg-teal-500' : 'bg-purple-500'}`} />
      
      <CardContent className="p-5 pl-6">
        {/* Top section: Icon and Title */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`p-2 rounded-lg ${getEventColor()} flex-shrink-0`}>
            {getEventIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base mb-1 line-clamp-1">{event.title}</h3>
            <Badge variant="secondary" className="text-xs">
              {event.eventType.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
          </div>
        </div>

        {/* Date and Time */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{format(new Date(event.startTime), "EEEE, MMMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
            <span>
              {format(new Date(event.startTime), "h:mm a")} - {format(new Date(event.endTime), "h:mm a")}
            </span>
          </div>
        </div>

        {/* Participant Avatars */}
        {visibleParticipants.length > 0 && (
          <div className="flex items-center gap-1 mb-4">
            <div className="flex -space-x-2">
              {visibleParticipants.map((participant, index) => (
                <Avatar 
                  key={participant.userId} 
                  className="h-8 w-8 border-2 border-background ring-1 ring-border"
                  style={{ zIndex: visibleParticipants.length - index }}
                >
                  <AvatarImage src={participant.user?.profileImage || undefined} />
                  <AvatarFallback className="text-xs">
                    {participant.user?.firstName?.[0]}{participant.user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            {remainingCount > 0 && (
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 border-2 border-background text-xs font-medium text-primary">
                +{remainingCount}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {!isPast && event.meetingLink && (
            <Button 
              size="sm" 
              className="flex-1"
              onClick={handleStartMeeting}
            >
              <Play className="h-3.5 w-3.5 mr-1.5" />
              Start
            </Button>
          )}
          
          <Button 
            size="sm" 
            variant="outline"
            className={!isPast && event.meetingLink ? "flex-none" : "flex-1"}
            onClick={handleCopyInvitation}
          >
            <Copy className="h-3.5 w-3.5 mr-1.5" />
            Copy Invitation
          </Button>

          {isOrganizer && onDelete && (
            <Button 
              size="sm" 
              variant="ghost"
              className="flex-none text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
