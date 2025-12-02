import { Plus, UserPlus, Calendar, Video } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ActionCard {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  gradient: string;
  onClick: () => void;
}

interface EventsActionCardsProps {
  onNewMeeting: () => void;
  onJoinMeeting: () => void;
  onScheduleMeeting: () => void;
  onViewRecordings: () => void;
}

export function EventsActionCards({
  onNewMeeting,
  onJoinMeeting,
  onScheduleMeeting,
  onViewRecordings,
}: EventsActionCardsProps) {
  const actionCards: ActionCard[] = [
    {
      icon: Plus,
      title: "New Meeting",
      subtitle: "Set up a new meeting",
      gradient: "from-purple-500/90 to-purple-600/90 dark:from-purple-600/80 dark:to-purple-700/80",
      onClick: onNewMeeting,
    },
    {
      icon: UserPlus,
      title: "Join Meeting",
      subtitle: "Via invitation link",
      gradient: "from-blue-500/90 to-blue-600/90 dark:from-blue-600/80 dark:to-blue-700/80",
      onClick: onJoinMeeting,
    },
    {
      icon: Calendar,
      title: "Schedule Meeting",
      subtitle: "Plan your meeting",
      gradient: "from-emerald-500/90 to-emerald-600/90 dark:from-emerald-600/80 dark:to-emerald-700/80",
      onClick: onScheduleMeeting,
    },
    {
      icon: Video,
      title: "View Recordings",
      subtitle: "Meeting recordings",
      gradient: "from-teal-500/90 to-teal-600/90 dark:from-teal-600/80 dark:to-teal-700/80",
      onClick: onViewRecordings,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actionCards.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <Card
            key={index}
            className="group cursor-pointer overflow-hidden border-border/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            onClick={card.onClick}
          >
            <CardContent className="p-0">
              <div className={`relative h-40 bg-gradient-to-br ${card.gradient} flex flex-col justify-between p-5`}>
                {/* Decorative background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12" />
                </div>

                {/* Icon */}
                <div className="relative">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>

                {/* Text */}
                <div className="relative space-y-1">
                  <h3 className="text-white font-semibold text-lg">
                    {card.title}
                  </h3>
                  <p className="text-white/90 text-sm">
                    {card.subtitle}
                  </p>
                </div>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
