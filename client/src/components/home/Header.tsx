import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ChevronDown, User, Settings, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import ProfileModal from "@/components/home/profile/ProfileModal";
import SettingsModal from "@/components/home/settings/SettingsModal";

interface HeaderProps { }

export default function Header({ }: HeaderProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const tabs = [
    { name: "Home", path: "/" },
    { name: "Meet the team", path: "/meet-the-team" },
    { name: "How we work", path: "/how-we-work" },
    { name: "Training", path: "/training" },
    { name: "Documents", path: "/documents" },
    { name: "Onboarding To do checklist", path: "/checklist" }
  ];

  const isActiveTab = (path: string) => {
    return location === path;
  };

  const handleProfileAction = (action: string) => {
    if (action === "Logout") {
      logoutMutation.mutate();
    } else {
      console.log(`${action} clicked`);
    }
  };

  return (
    <header className="bg-primary dark:bg-slate-950 text-primary-foreground dark:text-white sticky top-0 z-50 shadow-md dark:shadow-slate-900">
      {/* Top bar with logo and user profile */}
      <nav className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between border-b border-primary-border dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-foreground/20 dark:bg-slate-700 rounded flex items-center justify-center">
            <span className="text-sm font-semibold">I</span>
          </div>
          <h1 className="text-base sm:text-lg font-semibold truncate" data-testid="text-company-name">
            <span className="hidden sm:inline">Employee Onboarding</span>
            <span className="sm:hidden">Onboarding</span>
          </h1>
        </div>


        {/* Desktop Navigation tabs */}
        <div className="hidden md:hidden lg:block px-6 py-2">
          <div className="flex items-center gap-6 overflow-x-auto">
            {tabs.map((tab) => (
              <Link
                key={tab.path}
                href={tab.path}
                className={`text-sm whitespace-nowrap py-2 px-3 border-b-2 border-t-2 border-t-transparent transition-colors hover:bg-primary-foreground/10 rounded-t ${isActiveTab(tab.path)
                  ? "border-b-primary-foreground text-primary-foreground"
                  : "border-b-transparent text-primary-foreground/70 hover:text-primary-foreground"
                  }`}
                data-testid={`link-nav-${tab.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {tab.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* User profile dropdown */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 sm:gap-2" data-testid="button-user-menu">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.profileImage || undefined} />
                    <AvatarFallback className="text-xs bg-primary-foreground/20">
                      {user.firstName[0]}{user.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm hidden sm:inline">{user.firstName} {user.lastName}</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent sideOffset={20} className="bg-popover dark:bg-slate-800 dark:border-slate-700 -mr-16 w-[200px]">
                <DropdownMenuItem
                  onClick={() => setIsProfileModalOpen(true)}
                  data-testid="button-profile"
                  className="flex items-center space-x-4 text-sm cursor-pointer outline-none dark:text-white dark:hover:bg-slate-700"
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="flex items-center space-x-4 text-sm cursor-pointer outline-none dark:text-white dark:hover:bg-slate-700"
                  data-testid="button-settings"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="dark:bg-slate-700" />
                <DropdownMenuItem onClick={() => handleProfileAction("Logout")} className="text-red-600 dark:text-red-400 dark:hover:bg-slate-700" data-testid="button-logout">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden min-h-[44px] min-w-[44px] p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            data-testid="button-mobile-menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div id="mobile-navigation" className="border-t border-primary-border dark:border-slate-700 bg-primary/95 dark:bg-slate-900/95 backdrop-blur-sm" role="navigation" aria-label="Mobile navigation">
          <div className="px-4 py-3 space-y-1">
            {tabs.map((tab) => (
              <Link
                key={tab.path}
                href={tab.path}
                className={`block px-4 py-3 rounded-md text-base font-medium min-h-[44px] flex items-center transition-colors ${isActiveTab(tab.path)
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  }`}
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid={`link-mobile-nav-${tab.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {tab.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Profile Modal */}
      <ProfileModal isOpen={isProfileModalOpen} onClose={setIsProfileModalOpen} />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={setIsSettingsModalOpen} />
    </header>
  );
}