import { useState, useMemo, useCallback } from "react";
import { Calendar, dateFnsLocalizer, View, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import type { EventWithDetails } from "@/hooks/use-events";
import "./calendar-styles.css";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: EventWithDetails;
}

interface EventCalendarProps {
  events: EventWithDetails[];
  onSelectEvent?: (event: EventWithDetails) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
  defaultView?: View;
}

const eventTypeColors: Record<string, string> = {
  company_event: "#9333ea", // purple
  training: "#3b82f6", // blue
  team_meeting: "#10b981", // emerald
  "1on1": "#14b8a6", // teal
};

export function EventCalendar({
  events,
  onSelectEvent,
  onSelectSlot,
  defaultView = Views.MONTH,
}: EventCalendarProps) {
  const [view, setView] = useState<View>(defaultView);
  const [date, setDate] = useState(new Date());

  // Transform events for calendar
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return events.map((event) => ({
      id: event.id,
      title: event.title,
      start: new Date(event.startTime),
      end: new Date(event.endTime),
      resource: event,
    }));
  }, [events]);

  // Custom event style getter
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const backgroundColor = eventTypeColors[event.resource.eventType] || "#6b7280";
    
    return {
      style: {
        backgroundColor,
        borderRadius: "6px",
        opacity: 0.9,
        color: "white",
        border: "none",
        display: "block",
        fontSize: "0.875rem",
        padding: "2px 6px",
      },
    };
  }, []);

  // Handle event selection
  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      onSelectEvent?.(event.resource);
    },
    [onSelectEvent]
  );

  // Handle slot selection (for creating events)
  const handleSelectSlot = useCallback(
    (slotInfo: { start: Date; end: Date; action: string }) => {
      if (slotInfo.action === "select" || slotInfo.action === "click") {
        onSelectSlot?.(slotInfo);
      }
    },
    [onSelectSlot]
  );

  // Custom toolbar component
  const CustomToolbar = ({ label, onNavigate, onView }: any) => {
    return (
      <div className="rbc-toolbar flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 pb-4 border-b">
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1.5 text-sm font-medium border rounded-md hover:bg-accent transition-colors"
            onClick={() => onNavigate("TODAY")}
          >
            Today
          </button>
          <button
            className="px-3 py-1.5 text-sm font-medium border rounded-md hover:bg-accent transition-colors"
            onClick={() => onNavigate("PREV")}
          >
            ←
          </button>
          <button
            className="px-3 py-1.5 text-sm font-medium border rounded-md hover:bg-accent transition-colors"
            onClick={() => onNavigate("NEXT")}
          >
            →
          </button>
        </div>

        <span className="text-lg font-semibold">{label}</span>

        <div className="flex items-center gap-2">
          <button
            className={`px-3 py-1.5 text-sm font-medium border rounded-md transition-colors ${
              view === Views.MONTH ? "bg-primary text-primary-foreground" : "hover:bg-accent"
            }`}
            onClick={() => onView(Views.MONTH)}
          >
            Month
          </button>
          <button
            className={`px-3 py-1.5 text-sm font-medium border rounded-md transition-colors ${
              view === Views.WEEK ? "bg-primary text-primary-foreground" : "hover:bg-accent"
            }`}
            onClick={() => onView(Views.WEEK)}
          >
            Week
          </button>
          <button
            className={`px-3 py-1.5 text-sm font-medium border rounded-md transition-colors ${
              view === Views.DAY ? "bg-primary text-primary-foreground" : "hover:bg-accent"
            }`}
            onClick={() => onView(Views.DAY)}
          >
            Day
          </button>
          <button
            className={`px-3 py-1.5 text-sm font-medium border rounded-md transition-colors ${
              view === Views.AGENDA ? "bg-primary text-primary-foreground" : "hover:bg-accent"
            }`}
            onClick={() => onView(Views.AGENDA)}
          >
            Agenda
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-container bg-background border rounded-lg p-4">
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 700 }}
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable
        eventPropGetter={eventStyleGetter}
        components={{
          toolbar: CustomToolbar,
        }}
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        popup
        showMultiDayTimes
      />
    </div>
  );
}
