import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar } from "lucide-react";
import { SiLinkedin, SiFacebook } from "react-icons/si";
import managerImage from "@assets/generated_images/Marketing_manager_headshot_78fdbb6a.png";
import directorImage from "@assets/generated_images/Director_professional_headshot_35910231.png";

export default function Sidebar() {
  const [news] = useState([
    {
      id: "1",
      title: "Create a news post",
      description: "Keep your audience...",
      author: "now",
      isAction: true
    },
    {
      id: "2",
      title: "Keep your team updated with news...",
      description: "From the site home pag...",
      author: "SharePoint",
      time: "22 minutes ago",
      isAction: false
    }
  ]);

  const [events] = useState([
    {
      id: "1",
      title: "Title of event",
      date: "Tuesday 12:00 AM - 1:00 PM",
      month: "01"
    },
    {
      id: "2",
      title: "Title of event",
      date: "Tuesday 12:00 AM - 1:00 PM",
      month: "01"
    },
    {
      id: "3",
      title: "Title of event",
      date: "Tuesday 12:00 AM - 1:00 PM",
      month: "01"
    }
  ]);

  const [teamMembers] = useState([
    {
      id: "1",
      name: "Megan Bowen",
      role: "Marketing manager",
      image: managerImage
    },
    {
      id: "2",
      name: "Lynne Robbins",
      role: "Planner",
      image: undefined
    },
    {
      id: "3",
      name: "Lee Gu",
      role: "Director",
      image: directorImage
    },
    {
      id: "4",
      name: "Emily Braun",
      role: "Budget analyst",
      image: undefined
    }
  ]);

  const handleAddNews = () => {
    console.log("Add news clicked");
  };

  const handleAddEvent = () => {
    console.log("Add event clicked");
  };

  const handleCreateEvent = () => {
    console.log("Create an event clicked");
  };

  const handleSeeAllEvents = () => {
    console.log("See all events clicked");
  };

  return (
    <div className="w-full space-y-4 lg:space-y-6">
      {/* News & Announcements */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-4">
          <h3 className="text-lg font-semibold" data-testid="text-news-title">News & Announcements</h3>
          <Button
            onClick={handleAddNews}
            variant="ghost"
            size="sm"
            className="h-auto p-1 text-primary text-sm"
            data-testid="button-add-news"
          >
            See all
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {news.map((item) => (
            <div key={item.id} className="flex gap-3">
              {item.isAction ? (
                <div className="w-12 h-12 bg-primary rounded flex items-center justify-center flex-shrink-0">
                  <Plus className="w-6 h-6 text-primary-foreground" />
                </div>
              ) : (
                <div className="w-12 h-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-xs">📰</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground" data-testid={`text-news-${item.id}-title`}>
                  {item.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1" data-testid={`text-news-${item.id}-description`}>
                  {item.description}
                </p>
                <div className="text-xs text-muted-foreground mt-1">
                  {item.author} {item.time}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-4">
          <h3 className="text-lg font-semibold" data-testid="text-events-title">Upcoming Events</h3>
          <Button
            onClick={handleSeeAllEvents}
            variant="ghost"
            size="sm"
            className="text-primary text-sm"
            data-testid="button-see-all-events"
          >
            See all
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleAddEvent}
            variant="ghost"
            size="sm"
            className="w-full justify-start h-auto p-2"
            data-testid="button-add-event"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add event
          </Button>

          <div className="bg-primary text-primary-foreground p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Create an event</span>
            </div>
            <p className="text-xs text-primary-foreground/80 mb-3">
              When you add an event, it will show here where your readers can see it.
            </p>
            <Button
              onClick={handleCreateEvent}
              variant="secondary"
              size="sm"
              data-testid="button-create-event"
            >
              Create an event
            </Button>
          </div>

          {events.map((event) => (
            <div key={event.id} className="flex gap-3">
              <div className="text-center flex-shrink-0">
                <div className="text-xs text-muted-foreground">Month</div>
                <div className="text-lg font-semibold text-foreground">{event.month}</div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground" data-testid={`text-event-${event.id}-title`}>
                  {event.title}
                </h4>
                <p className="text-xs text-muted-foreground" data-testid={`text-event-${event.id}-date`}>
                  {event.date}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Meet the onboarding team */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold" data-testid="text-team-title">Meet the onboarding team</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          {teamMembers.map((member) => (
            <div key={member.id} className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={member.image} />
                <AvatarFallback className="bg-muted">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground" data-testid={`text-member-${member.id}-name`}>
                  {member.name}
                </h4>
                <p className="text-xs text-muted-foreground" data-testid={`text-member-${member.id}-role`}>
                  {member.role}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold" data-testid="text-links-title">Quick Links</h3>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-primary"
            data-testid="link-linkedin"
          >
            <SiLinkedin className="w-4 h-4 mr-2" />
            LinkedIn
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-primary"
            data-testid="link-facebook"
          >
            <SiFacebook className="w-4 h-4 mr-2" />
            Facebook
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}