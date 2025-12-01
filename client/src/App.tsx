import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import AuthPage from "@/pages/AuthPage";
import ResetPassword from "@/pages/ResetPassword";
import MeetTheTeam from "@/pages/MeetTheTeam";
import HowWeWork from "@/pages/HowWeWork";
import Training from "@/pages/Training";
import Checklist from "@/pages/Checklist";
import Documents from "@/pages/Documents";
import NewsAnnouncement from "@/pages/NewsAnnouncement";
import Events from "@/pages/Events";
import Layout from "@/components/Layout";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/contexts/ThemeContext";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="*">
        {(params) => (
          <Layout>
            <Switch>
              <ProtectedRoute path="/" component={Dashboard} />
              <ProtectedRoute path="/meet-the-team" component={MeetTheTeam} />
              <ProtectedRoute path="/how-we-work" component={HowWeWork} />
              <ProtectedRoute path="/training" component={Training} />
              <ProtectedRoute path="/documents" component={Documents} />
              <ProtectedRoute path="/checklist" component={Checklist} />
              <ProtectedRoute path="/events" component={Events} />
              <ProtectedRoute path="/news-announcements" component={NewsAnnouncement} />
              <Route component={NotFound} />
            </Switch>
          </Layout>
        )}
      </Route>
    </Switch>
  );
}

function App() {
return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <ThemeProvider>
            <Toaster />
            <Router />
          </ThemeProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;