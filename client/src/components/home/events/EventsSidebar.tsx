import { Home, Calendar, Clock, Video, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EventsSidebarProps {
  activeSection: "home" | "upcoming" | "previous" | "recordings";
  onSectionChange: (section: "home" | "upcoming" | "previous" | "recordings") => void;
  onCreateMeeting?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

export function EventsSidebar({ 
  activeSection, 
  onSectionChange, 
  onCreateMeeting,
  isOpen = true,
  onClose,
  isMobile = false
}: EventsSidebarProps) {
  const menuItems = [
    { id: "home" as const, icon: Home, label: "Home" },
    { id: "upcoming" as const, icon: Calendar, label: "Upcoming" },
    { id: "previous" as const, icon: Clock, label: "Previous" },
    { id: "recordings" as const, icon: Video, label: "Recordings" },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "w-64 border-r border-border bg-background dark:bg-slate-900 p-4 space-y-2",
        isMobile && "fixed left-0 top-0 h-full z-50 shadow-xl"
      )}>
        {/* Close button for mobile */}
        {isMobile && (
          <div className="flex justify-end mb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="md:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                "hover:bg-accent/50",
                isActive && "bg-primary text-primary-foreground hover:bg-primary"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 flex-shrink-0",
                isActive && "text-primary-foreground"
              )} />
              <span className={cn(
                "font-medium text-sm",
                isActive && "text-primary-foreground"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
        
        {/* Create New Meeting Button */}
        <button
          onClick={onCreateMeeting}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 border border-primary/30 hover:bg-primary/10"
        >
          <Plus className="h-5 w-5 flex-shrink-0 text-primary" />
          <span className="font-medium text-sm text-primary">
            Create New Meeting
          </span>
        </button>
      </aside>
    </>
  );
}
