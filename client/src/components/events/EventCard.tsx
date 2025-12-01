import { format } from "date-fns";
import { Calendar, Clock, MapPin, Users, Video, CheckCircle, XCircle, HelpCircle, Clock as Pending } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { EventWithDetails } from "@/hooks/use-events";
import { useAuth } from "@/hooks/use-auth";

interface EventCardProps {
  event: EventWithDetails;
  onRSVP?: (status: "accepted" | "declined" | "maybe") => void;
  onClick?: () => void;
  showActions?: boolean;
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

const statusIcons = {
  accepted: <CheckCircle className="h-4 w-4 text-green-600" />,
  declined: <XCircle className="h-4 w-4 text-red-600" />,
  maybe: <HelpCircle className="h-4 w-4 text-yellow-600" />,
  pending: <Pending className="h-4 w-4 text-gray-400" />,
};

const statusLabels = {
  accepted: "Going",
  declined: "Not Going",
  maybe: "Maybe",
  pending: "Pending",
};

export function EventCard({ event, onRSVP, onClick, showActions = true }: EventCardProps) {
  const { user } = useAuth();
  const isOrganizer = user?.id === event.organizer.id;
  const participantStatus = event.participantStatus || "pending";

  const eventDate = new Date(event.startTime);
  const endDate = new Date(event.endTime);
  const isUpcoming = eventDate > new Date();
  const isPast = endDate < new Date();

  return (
    <Card 
      className={`hover:shadow-lg transition-shadow cursor-pointer ${isPast ? 'opacity-70' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant="outline" 
                className={eventTypeColors[event.eventType as keyof typeof eventTypeColors]}
              >
                {eventTypeLabels[event.eventType as keyof typeof eventTypeLabels]}
              </Badge>
              {event.isMandatory && (
                <Badge variant="destructive" className="text-xs">
                  Mandatory
                </Badge>
              )}
              {isPast && (
                <Badge variant="secondary" className="text-xs">
                  Past
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-semibold leading-tight">{event.title}</h3>
          </div>
          {!isOrganizer && (
            <div className="flex items-center gap-1 text-sm">
              {statusIcons[participantStatus as keyof typeof statusIcons]}
              <span className="text-xs text-muted-foreground">
                {statusLabels[participantStatus as keyof typeof statusLabels]}
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Event Description */}
        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Date & Time */}
        <div className="flex items-start gap-2 text-sm">
          <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
          <div>
            <p className="font-medium">{format(eventDate, "EEEE, MMMM d, yyyy")}</p>
            <p className="text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {format(eventDate, "h:mm a")} - {format(endDate, "h:mm a")}
            </p>
          </div>
        </div>

        {/* Location */}
        {event.location && (
          <div className="flex items-center gap-2 text-sm">
            {event.location === "Virtual" || event.meetingLink ? (
              <>
                <Video className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">Virtual Meeting</span>
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">{event.location}</span>
              </>
            )}
          </div>
        )}

        {/* Organizer & Participants */}
        <div className="flex items-center justify-between text-sm pt-2 border-t">
          <div className="flex items-center gap-2">
            {event.organizer.profileImage ? (
              <img
                src={event.organizer.profileImage}
                alt={`${event.organizer.firstName} ${event.organizer.lastName}`}
                className="h-6 w-6 rounded-full object-cover"
              />
            ) : (
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                {event.organizer.firstName[0]}{event.organizer.lastName[0]}
              </div>
            )}
            <span className="text-muted-foreground">
              {isOrganizer ? "You" : `${event.organizer.firstName} ${event.organizer.lastName}`}
            </span>
          </div>

          {event.participantCount !== undefined && event.participantCount > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{event.participantCount} attending</span>
            </div>
          )}
        </div>

        {/* RSVP Actions */}
        {showActions && !isOrganizer && isUpcoming && onRSVP && (
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant={participantStatus === "accepted" ? "default" : "outline"}
              onClick={(e) => {
                e.stopPropagation();
                onRSVP("accepted");
              }}
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Going
            </Button>
            <Button
              size="sm"
              variant={participantStatus === "maybe" ? "default" : "outline"}
              onClick={(e) => {
                e.stopPropagation();
                onRSVP("maybe");
              }}
              className="flex-1"
            >
              <HelpCircle className="h-4 w-4 mr-1" />
              Maybe
            </Button>
            <Button
              size="sm"
              variant={participantStatus === "declined" ? "default" : "outline"}
              onClick={(e) => {
                e.stopPropagation();
                onRSVP("declined");
              }}
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-1" />
              Decline
            </Button>
          </div>
        )}

        {isOrganizer && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2">
            <Users className="h-3 w-3" />
            <span>You're organizing this event</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
