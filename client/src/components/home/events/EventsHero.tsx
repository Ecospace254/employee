import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import type { EventWithDetails } from "@/hooks/use-events";
import heroBackground from "@assets/hero-EventsBackground.png";

interface EventsHeroProps {
  upcomingMeeting?: EventWithDetails;
}

export function EventsHero({ upcomingMeeting }: EventsHeroProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    const hours = format(date, "h:mm");
    const period = format(date, "a");
    return { hours, period };
  };

  const { hours, period } = formatTime(currentTime);
  const currentDate = format(currentTime, "EEEE, dd MMMM, yyyy");

  return (
    <div className="relative h-80 rounded-2xl overflow-hidden group">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        {/* Dark overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60 dark:from-black/60 dark:via-black/50 dark:to-black/80" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-8">
        {/* Top: Upcoming meeting badge */}
        <div>
          {upcomingMeeting && (
            <Badge className="bg-primary/90 backdrop-blur-sm text-primary-foreground border-0 px-4 py-2 text-sm font-medium shadow-lg">
              Upcoming Meeting at: {format(new Date(upcomingMeeting.startTime), "h:mm a")}
            </Badge>
          )}
        </div>

        {/* Bottom: Time and Date */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-7xl font-bold text-white tracking-tight drop-shadow-lg">
              {hours}
            </span>
            <span className="text-4xl font-semibold text-white/90 drop-shadow-lg">
              {period}
            </span>
          </div>
          <p className="text-xl text-white/90 font-medium drop-shadow-md">
            {currentDate}
          </p>
        </div>
      </div>

      {/* Subtle animation on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/0 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  );
}
