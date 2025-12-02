import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Users, Plus, X, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { useEvents } from "@/hooks/use-events";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

const eventSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().optional(),
  eventType: z.enum(["company_event", "training", "team_meeting", "1on1"]),
  startTime: z.date({ required_error: "Start time is required" }),
  endTime: z.date({ required_error: "End time is required" }),
  location: z.string().optional(),
  meetingLink: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  isMandatory: z.boolean().default(false),
  maxParticipants: z.number().optional(),
}).refine((data) => data.endTime > data.startTime, {
  message: "End time must be after start time",
  path: ["endTime"],
});

type EventFormData = z.infer<typeof eventSchema>;

interface CreateEventDialogProps {
  children?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
}

export function CreateEventDialog({ 
  children, 
  isOpen: externalOpen, 
  onOpenChange: externalOnOpenChange,
  initialStartDate,
  initialEndDate 
}: CreateEventDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;
  const [startDate, setStartDate] = useState<Date | undefined>(initialStartDate);
  const [endDate, setEndDate] = useState<Date | undefined>(initialEndDate);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  const { createEvent } = useEvents();
  const { toast } = useToast();

  // Fetch team members for participant selection
  const { data: teamMembers = [] } = useQuery<User[]>({
    queryKey: ["/api/team-members"],
    queryFn: async () => {
      const response = await fetch("/api/team-members", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch team members");
      return response.json();
    },
  });

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      eventType: "team_meeting",
      location: "",
      meetingLink: "",
      isMandatory: false,
    },
  });

  const onSubmit = async (data: EventFormData) => {
    try {
      await createEvent.mutateAsync({
        ...data,
        participantIds: selectedParticipants,
      });

      toast({
        title: "Event created!",
        description: "Your event has been created successfully.",
      });

      setOpen(false);
      form.reset();
      setSelectedParticipants([]);
      setStartDate(undefined);
      setEndDate(undefined);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStartDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setStartDate(date);
    
    // Combine date with time
    const [hours, minutes] = startTime.split(":");
    const dateTime = new Date(date);
    dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    form.setValue("startTime", dateTime);
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setEndDate(date);
    
    // Combine date with time
    const [hours, minutes] = endTime.split(":");
    const dateTime = new Date(date);
    dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    form.setValue("endTime", dateTime);
  };

  const handleStartTimeChange = (time: string) => {
    setStartTime(time);
    if (startDate) {
      const [hours, minutes] = time.split(":");
      const dateTime = new Date(startDate);
      dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      form.setValue("startTime", dateTime);
    }
  };

  const handleEndTimeChange = (time: string) => {
    setEndTime(time);
    if (endDate) {
      const [hours, minutes] = time.split(":");
      const dateTime = new Date(endDate);
      dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      form.setValue("endTime", dateTime);
    }
  };

  const toggleParticipant = (userId: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            Schedule a new event and invite team members
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Team Standup" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Event Type */}
            <FormField
              control={form.control}
              name="eventType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="company_event">Company Event</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="team_meeting">Team Meeting</SelectItem>
                      <SelectItem value="1on1">1-on-1</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What's this event about?"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Start Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={() => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="pl-3 text-left font-normal"
                          >
                            {startDate ? (
                              format(startDate, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={handleStartDateSelect}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem className="flex flex-col">
                <FormLabel>Start Time *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="pl-3 text-left font-normal"
                      >
                        {startTime || <span>Pick a time</span>}
                        <Clock className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-3" align="start">
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => handleStartTimeChange(e.target.value)}
                      className="w-full"
                    />
                  </PopoverContent>
                </Popover>
              </FormItem>
            </div>

            {/* End Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="endTime"
                render={() => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="pl-3 text-left font-normal"
                          >
                            {endDate ? (
                              format(endDate, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={handleEndDateSelect}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem className="flex flex-col">
                <FormLabel>End Time *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="pl-3 text-left font-normal"
                      >
                        {endTime || <span>Pick a time</span>}
                        <Clock className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-3" align="start">
                    <Input
                      type="time"
                      value={endTime}
                      onChange={(e) => handleEndTimeChange(e.target.value)}
                      className="w-full"
                    />
                  </PopoverContent>
                </Popover>
              </FormItem>
            </div>

            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Conference Room A or Virtual" {...field} />
                  </FormControl>
                  <FormDescription>
                    Physical location or "Virtual" for online meetings
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Meeting Link */}
            <FormField
              control={form.control}
              name="meetingLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Link</FormLabel>
                  <FormControl>
                    <Input placeholder="https://meet.google.com/..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Video conference link for virtual meetings
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Participants */}
            <FormItem>
              <FormLabel>Invite Participants</FormLabel>
              <FormDescription>
                Select team members to invite to this event
              </FormDescription>
              <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                {teamMembers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No team members found</p>
                ) : (
                  teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-2 p-2 hover:bg-accent rounded-md cursor-pointer"
                      onClick={() => toggleParticipant(member.id)}
                    >
                      <div className={`h-4 w-4 border rounded flex items-center justify-center ${
                        selectedParticipants.includes(member.id)
                          ? "bg-primary border-primary"
                          : "border-input"
                      }`}>
                        {selectedParticipants.includes(member.id) && (
                          <svg className="h-3 w-3 text-primary-foreground" viewBox="0 0 12 12">
                            <polyline points="2,6 5,9 10,3" fill="none" stroke="currentColor" strokeWidth="2" />
                          </svg>
                        )}
                      </div>
                      {member.profileImage ? (
                        <img
                          src={member.profileImage}
                          alt={`${member.firstName} ${member.lastName}`}
                          className="h-6 w-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                          {member.firstName[0]}{member.lastName[0]}
                        </div>
                      )}
                      <span className="text-sm">
                        {member.firstName} {member.lastName}
                      </span>
                      {member.jobTitle && (
                        <span className="text-xs text-muted-foreground">
                          ({member.jobTitle})
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
              {selectedParticipants.length > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedParticipants.length} participant(s) selected
                </p>
              )}
            </FormItem>

            {/* Mandatory */}
            <FormField
              control={form.control}
              name="isMandatory"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Mandatory Attendance</FormLabel>
                    <FormDescription>
                      Mark this event as required for participants
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Submit */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createEvent.isPending}>
                {createEvent.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Event
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
