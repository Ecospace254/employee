import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Event, EventParticipant, InsertEvent } from "@shared/schema";

// Extended Event type with organizer and participant info
export type EventWithDetails = Event & {
  organizer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string;
  };
  participantCount?: number;
  participantStatus?: string;
  participants?: (EventParticipant & {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      profileImage?: string;
    };
  })[];
};

interface EventFilters {
  eventType?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
}

/**
 * Custom hook for event management
 * Provides CRUD operations and RSVP functionality
 */
export function useEvents(filters?: EventFilters) {
  const queryClient = useQueryClient();

  // Build query string from filters
  const queryString = filters
    ? "?" + new URLSearchParams(
        Object.entries(filters).filter(([_, value]) => value !== undefined) as [string, string][]
      ).toString()
    : "";

  // Fetch all events with optional filters
  const {
    data: events,
    isLoading,
    error,
  } = useQuery<EventWithDetails[]>({
    queryKey: ["/api/events", filters],
    queryFn: async () => {
      const response = await fetch(`/api/events${queryString}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      return response.json();
    },
    staleTime: 60000, // Consider data fresh for 1 minute
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
    refetchInterval: false, // Don't poll
  });

  // Fetch single event by ID
  const useEvent = (eventId: string | undefined) => {
    return useQuery<EventWithDetails>({
      queryKey: ["/api/events", eventId],
      queryFn: async () => {
        if (!eventId) throw new Error("Event ID is required");

        const response = await fetch(`/api/events/${eventId}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch event");
        }

        return response.json();
      },
      enabled: !!eventId,
    });
  };

  // Fetch upcoming events for sidebar
  const useUpcomingEvents = (limit: number = 5) => {
    return useQuery<EventWithDetails[]>({
      queryKey: ["/api/events/upcoming/sidebar"],
      queryFn: async () => {
        const response = await fetch(`/api/events/upcoming/sidebar`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch upcoming events");
        }

        return response.json();
      },
    });
  };

  // Create new event
  const createEvent = useMutation({
    mutationFn: async (eventData: Omit<InsertEvent, "organizerId"> & { participantIds?: string[] }) => {
      const { participantIds, ...eventDetails } = eventData;

      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventDetails),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to create event");
      }

      const newEvent = await response.json();

      // If participants are specified, add them
      if (participantIds && participantIds.length > 0) {
        await fetch(`/api/events/${newEvent.id}/participants`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userIds: participantIds }),
          credentials: "include",
        });
      }

      return newEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events/upcoming/sidebar"] });
    },
  });

  // Update event
  const updateEvent = useMutation({
    mutationFn: async ({ eventId, updates }: { eventId: string; updates: Partial<InsertEvent> }) => {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to update event");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events", variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ["/api/events/upcoming/sidebar"] });
    },
  });

  // Delete event
  const deleteEvent = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events/upcoming/sidebar"] });
    },
  });

  // Update RSVP status
  const updateRSVP = useMutation({
    mutationFn: async ({
      eventId,
      userId,
      status,
    }: {
      eventId: string;
      userId: string;
      status: "pending" | "accepted" | "declined" | "maybe";
    }) => {
      const response = await fetch(`/api/events/${eventId}/participants/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to update RSVP");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events", variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ["/api/events/upcoming/sidebar"] });
    },
  });

  // Add participants to event
  const addParticipants = useMutation({
    mutationFn: async ({ eventId, userIds }: { eventId: string; userIds: string[] }) => {
      const response = await fetch(`/api/events/${eventId}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to add participants");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", variables.eventId] });
    },
  });

  return {
    // Data
    events,
    isLoading,
    error,

    // Mutations
    createEvent,
    updateEvent,
    deleteEvent,
    updateRSVP,
    addParticipants,

    // Additional queries
    useEvent,
    useUpcomingEvents,
  };
}

/**
 * Hook to fetch upcoming events for sidebar widget
 */
export function useUpcomingEvents(limit: number = 5) {
  return useQuery<EventWithDetails[]>({
    queryKey: ["/api/events/upcoming/sidebar", limit],
    queryFn: async () => {
      const response = await fetch(`/api/events/upcoming/sidebar?limit=${limit}`, {
        credentials: "include",
      });

      if (!response.ok) {
        console.error("Failed to fetch upcoming events:", response.status);
        return []; // Return empty array on error instead of throwing
      }

      return response.json();
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    retry: false, // Don't retry on auth errors
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });
}
