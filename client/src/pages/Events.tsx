import { useState } from "react";
import { useEvents } from "@/hooks/use-events";
import { EventList } from "@/components/events/EventList";
import { EventCalendar } from "@/components/events/EventCalendar";
import { CreateEventDialog } from "@/components/events/CreateEventDialog";
import { EventDetailsModal } from "@/components/events/EventDetailsModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Calendar, List, Grid } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { EventWithDetails } from "@/hooks/use-events";

export default function Events() {
  const { user } = useAuth();
  const [eventTypeFilter, setEventTypeFilter] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<"upcoming" | "my-events" | "all">("upcoming");
  const [displayMode, setDisplayMode] = useState<"list" | "calendar">("list");
  const [selectedEvent, setSelectedEvent] = useState<EventWithDetails | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [prefilledDate, setPrefilledDate] = useState<{ start: Date; end: Date } | null>(null);

  // Fetch events based on current view
  const now = new Date().toISOString();
  const { events, isLoading } = useEvents(
    viewMode === "my-events"
      ? { userId: user?.id }
      : viewMode === "upcoming"
      ? { startDate: now }
      : undefined
  );

  // Filter by event type if selected
  const filteredEvents = eventTypeFilter
    ? events?.filter((event) => event.eventType === eventTypeFilter)
    : events;

  // Sort events by start time
  const sortedEvents = filteredEvents?.sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  const handleEventClick = (event: EventWithDetails) => {
    setSelectedEvent(event);
  };

  const handleSlotSelect = (slotInfo: { start: Date; end: Date }) => {
    setPrefilledDate(slotInfo);
    setShowCreateDialog(true);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 dark:bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Events</h1>
            <p className="text-muted-foreground mt-1">
              Manage and attend company events, meetings, and training sessions
            </p>
          </div>
          <CreateEventDialog>
            <Button size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Create Event
            </Button>
          </CreateEventDialog>
        </div>

        {/* Filters and View Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* View Mode Tabs */}
          <Tabs
            value={viewMode}
            onValueChange={(value) => setViewMode(value as typeof viewMode)}
            className="flex-1"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upcoming" className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="hidden sm:inline">Upcoming</span>
              </TabsTrigger>
              <TabsTrigger value="my-events" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">My Events</span>
              </TabsTrigger>
              <TabsTrigger value="all" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">All Events</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Display Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={displayMode === "list" ? "default" : "outline"}
              onClick={() => setDisplayMode("list")}
              className="flex-1 lg:flex-initial"
            >
              <List className="h-4 w-4 mr-2" />
              List
            </Button>
            <Button
              variant={displayMode === "calendar" ? "default" : "outline"}
              onClick={() => setDisplayMode("calendar")}
              className="flex-1 lg:flex-initial"
            >
              <Grid className="h-4 w-4 mr-2" />
              Calendar
            </Button>
          </div>

          {/* Event Type Filter */}
          <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
            <SelectTrigger className="w-full lg:w-[200px]">
              <SelectValue placeholder="All Event Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" onClick={() => setEventTypeFilter(undefined)}>
                All Event Types
              </SelectItem>
              <SelectItem value="company_event">Company Event</SelectItem>
              <SelectItem value="training">Training</SelectItem>
              <SelectItem value="team_meeting">Team Meeting</SelectItem>
              <SelectItem value="1on1">1-on-1</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Event Count */}
        {!isLoading && sortedEvents && displayMode === "list" && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {sortedEvents.length} event{sortedEvents.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}

        {/* List or Calendar View */}
        {displayMode === "list" ? (
          <EventList
            events={sortedEvents}
            isLoading={isLoading}
            onEventClick={handleEventClick}
            emptyMessage={
              viewMode === "my-events"
                ? "You haven't created or been invited to any events yet"
                : viewMode === "upcoming"
                ? "No upcoming events scheduled"
                : "No events found"
            }
          />
        ) : (
          <EventCalendar
            events={sortedEvents || []}
            onSelectEvent={handleEventClick}
            onSelectSlot={handleSlotSelect}
          />
        )}

        {/* Event Details Modal */}
        <EventDetailsModal
          event={selectedEvent}
          open={!!selectedEvent}
          onOpenChange={(open) => !open && setSelectedEvent(null)}
          onEdit={() => {
            // TODO: Implement edit functionality
            console.log("Edit event:", selectedEvent);
          }}
        />
      </div>
    </div>
  );
}
