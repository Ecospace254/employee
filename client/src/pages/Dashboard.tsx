import WelcomeHero from "@/components/WelcomeHero";
import ActionCards from "@/components/ActionCards";
import PopularPortals from "@/components/PopularPortals";
import CompanyCulture from "@/components/CompanyCulture";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/hooks/use-auth";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 dark:bg-slate-950 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          <WelcomeHero userName={user?.firstName} />
          <ActionCards />
          <PopularPortals />
          <CompanyCulture />
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Sidebar />
        </div>
      </div>
    </div>
  );
}