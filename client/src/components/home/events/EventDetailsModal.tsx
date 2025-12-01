import { format } from "date-fns";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Users, 
  User,
  CheckCircle, 
  XCircle, 
  HelpCircle,
  ExternalLink,
  Edit,
  Trash2,
  Copy
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { EventWithDetails } from "@/hooks/use-events";
import { useAuth } from "@/hooks/use-auth";
import { useEvents } from "@/hooks/use-events";
import { useToast } from "@/hooks/use-toast";

interface EventDetailsModalProps {
  event: EventWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
}

const eventTypeColors = {
  company_event: "bg-purple-100 text-purple-700 border-purple-200",
  training: "bg-blue-100 text-blue-700 border-blue-200",
  team_meeting: "bg-emerald-100 text-emerald-700 border-emerald-200",
  "1on1": "bg-teal-100 text-teal-700 border-teal-200",
};

const eventTypeLabels = {
  company_event: "Company Event",
  training: "Training",
  team_meeting: "Team Meeting",
  "1on1": "1-on-1",
};

const statusInfo = {
  accepted: { 
    label: "Going", 
    icon: CheckCircle, 
    color: "text-green-600",
    bgColor: "bg-green-50 border-green-200"
  },
  declined: { 
    label: "Not Going", 
    icon: XCircle, 
    color: "text-red-600",
    bgColor: "bg-red-50 border-red-200"
  },
  maybe: { 
    label: "Maybe", 
    icon: HelpCircle, 
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 border-yellow-200"
  },
  pending: { 
    label: "No Response", 
    icon: Clock, 
    color: "text-gray-400",
    bgColor: "bg-gray-50 border-gray-200"
  },
};

export function EventDetailsModal({ event, open, onOpenChange, onEdit }: EventDetailsModalProps) {
  const { user } = useAuth();
  const { updateRSVP, deleteEvent } = useEvents();
  const { toast } = useToast();

  if (!event) return null;

  const isOrganizer = user?.id === event.organizer.id;
  const userParticipant = event.participants?.find((p) => p.userId === user?.id);
  const participantStatus = (userParticipant?.status || "pending") as keyof typeof statusInfo;

  const eventDate = new Date(event.startTime);
  const endDate = new Date(event.endTime);
  const isUpcoming = eventDate > new Date();
  const isPast = endDate < new Date();

  const handleRSVP = async (status: "accepted" | "declined" | "maybe") => {
    if (!user) return;

    try {
      await updateRSVP.mutateAsync({ eventId: event.id, userId: user.id, status });
      toast({
        title: "RSVP Updated",
        description: `You're now marked as "${statusInfo[status].label}"`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update RSVP. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteEvent.mutateAsync(event.id);
      toast({
        title: "Event Deleted",
        description: "The event has been deleted successfully.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyLink = () => {
    if (event.meetingLink) {
      navigator.clipboard.writeText(event.meetingLink);
      toast({
        title: "Link Copied",
        description: "Meeting link copied to clipboard",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge 
                  variant="outline" 
                  className={eventTypeColors[event.eventType as keyof typeof eventTypeColors]}
                >
                  {eventTypeLabels[event.eventType as keyof typeof eventTypeLabels]}
                </Badge>
                {event.isMandatory && (
                  <Badge variant="destructive">Mandatory</Badge>
                )}
                {isPast && (
                  <Badge variant="secondary">Past Event</Badge>
                )}
              </div>
              <DialogTitle className="text-2xl">{event.title}</DialogTitle>
            </div>
            
            {isOrganizer && (
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={onEdit}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleDelete}
                  disabled={deleteEvent.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)]">
          <div className="space-y-6">
            {/* Description */}
            {event.description && (
              <div>
                <DialogDescription className="text-base">
                  {event.description}
                </DialogDescription>
              </div>
            )}

            <Separator />

            {/* Date & Time */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="font-medium">{format(eventDate, "EEEE, MMMM d, yyyy")}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="h-4 w-4" />
                    {format(eventDate, "h:mm a")} - {format(endDate, "h:mm a")}
                  </p>
                </div>
              </div>

              {/* Location */}
              {event.location && (
                <div className="flex items-start gap-3">
                  {event.location === "Virtual" || event.meetingLink ? (
                    <Video className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <MapPin className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">
                      {event.location === "Virtual" || event.meetingLink ? "Virtual Meeting" : event.location}
                    </p>
                    {event.meetingLink && (
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(event.meetingLink!, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Join Meeting
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCopyLink}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Link
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Organizer */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Organizer
              </h3>
              <div className="flex items-center gap-3">
                {event.organizer.profileImage ? (
                  <img
                    src={event.organizer.profileImage}
                    alt={`${event.organizer.firstName} ${event.organizer.lastName}`}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-medium">
                    {event.organizer.firstName[0]}{event.organizer.lastName[0]}
                  </div>
                )}
                <div>
                  <p className="font-medium">
                    {event.organizer.firstName} {event.organizer.lastName}
                    {isOrganizer && " (You)"}
                  </p>
                  <p className="text-sm text-muted-foreground">{event.organizer.email}</p>
                </div>
              </div>
            </div>

            {/* Participants */}
            {event.participants && event.participants.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Participants ({event.participants.length})
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(
                      event.participants.reduce((acc, participant) => {
                        const status = participant.status || "pending";
                        if (!acc[status]) acc[status] = [];
                        acc[status].push(participant);
                        return acc;
                      }, {} as Record<string, typeof event.participants>)
                    ).map(([status, participants]) => {
                      const info = statusInfo[status as keyof typeof statusInfo];
                      const Icon = info.icon;
                      
                      return (
                        <div key={status}>
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className={`h-4 w-4 ${info.color}`} />
                            <span className="text-sm font-medium">{info.label} ({participants.length})</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-6">
                            {participants.map((participant) => (
                              <div key={participant.id} className="flex items-center gap-2">
                                {participant.user.profileImage ? (
                                  <img
                                    src={participant.user.profileImage}
                                    alt={`${participant.user.firstName} ${participant.user.lastName}`}
                                    className="h-6 w-6 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                                    {participant.user.firstName[0]}{participant.user.lastName[0]}
                                  </div>
                                )}
                                <span className="text-sm">
                                  {participant.user.firstName} {participant.user.lastName}
                                  {participant.userId === user?.id && " (You)"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* RSVP Section */}
            {!isOrganizer && isUpcoming && userParticipant && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold mb-3">Your Response</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={participantStatus === "accepted" ? "default" : "outline"}
                      onClick={() => handleRSVP("accepted")}
                      disabled={updateRSVP.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Going
                    </Button>
                    <Button
                      variant={participantStatus === "maybe" ? "default" : "outline"}
                      onClick={() => handleRSVP("maybe")}
                      disabled={updateRSVP.isPending}
                    >
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Maybe
                    </Button>
                    <Button
                      variant={participantStatus === "declined" ? "default" : "outline"}
                      onClick={() => handleRSVP("declined")}
                      disabled={updateRSVP.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Decline
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
