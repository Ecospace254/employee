import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, FileText, Monitor, Users, Settings, Lightbulb, HelpCircle, Heart, Eye, Bookmark } from "lucide-react";

// Import stock images
import heroImage from "@assets/stock_images/modern_office_worksp_512e1014.jpg";
import meetingRoom1 from "@assets/stock_images/office_meeting_room__dc2b21bd.jpg";
import meetingRoom2 from "@assets/stock_images/office_meeting_room__a0cbdaff.jpg";
import meetingRoom3 from "@assets/stock_images/office_meeting_room__cc49dbfb.jpg";
import workspace1 from "@assets/stock_images/person_working_at_de_7e78649f.jpg";
import workspace2 from "@assets/stock_images/person_working_at_de_fbcf41b0.jpg";

export default function Training() {
  // Set page title for SEO
  useEffect(() => {
    document.title = "Training - Digital Training Library | Internship";
    
    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Access our comprehensive digital training library with essential skills, policies, procedures, and tools to help you succeed in your new role.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Access our comprehensive digital training library with essential skills, policies, procedures, and tools to help you succeed in your new role.';
      document.getElementsByTagName('head')[0].appendChild(meta);
    }
  }, []);

  const essentialSkillsItems = [
    {
      title: "Video: Research and design strategy",
      image: meetingRoom1,
      type: "video"
    },
    {
      title: "Guide: Creating research reports",
      image: meetingRoom2,
      type: "guide"
    },
    {
      title: "Video: Using design guidelines",
      image: workspace1,
      type: "video"
    }
  ];

  const policiesItems = [
    {
      title: "Code of Conduct",
      image: null,
      type: "policy",
      isPolicyCard: true
    },
    {
      title: "Guide: Sharing files externally",
      image: meetingRoom1,
      type: "guide"
    },
    {
      title: "Video: Anonymizing participants",
      image: meetingRoom3,
      type: "video"
    },
    {
      title: "Video: Handling personal data",
      image: workspace2,
      type: "video"
    }
  ];

  const essentialToolsItems = [
    {
      title: "Video: Productivity tools",
      image: meetingRoom1,
      type: "video"
    },
    {
      title: "Guide: Find users for your study",
      image: meetingRoom2,
      type: "guide"
    },
    {
      title: "Video: Design and prototyping tools",
      image: workspace1,
      type: "video"
    }
  ];

  const moreResourcesItems = [
    {
      title: "Hybrid work guide",
      icon: Users
    },
    {
      title: "Request software and hardware",
      icon: Monitor
    },
    {
      title: "Find subject matter experts",
      icon: Lightbulb
    },
    {
      title: "Workplace collaboration guide",
      icon: HelpCircle
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Play className="w-4 h-4" />;
      case "guide":
        return <FileText className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="relative h-80 overflow-hidden">
        <img 
          src={heroImage} 
          alt="Training workspace" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-white" data-testid="text-page-title">
            Digital training library
          </h1>
        </div>
      </div>

      {/* Introduction Section */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-lg leading-relaxed text-justify" data-testid="text-intro-description">
            We want to make sure you have the resources you need to be successful in your new role. Training resources have been specifically curated to help new team members learn more about the organization, company culture, essential tools, and resources.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
        {/* Essential Skills Section */}
        <div>
          <div className="mb-8">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-primary mb-2" data-testid="text-essential-skills-header">
              ESSENTIAL SKILLS
            </h3>
            <h2 className="text-2xl font-bold mb-4" data-testid="text-research-skills-title">
              Research and design skills
            </h2>
            <p className="text-muted-foreground" data-testid="text-research-skills-description">
              Learn about key research and design skills needed in your day-to-day role.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {essentialSkillsItems.map((item, index) => (
              <div 
                key={index}
                className="hover-elevate"
                data-testid={`card-essential-skill-${index}`}
              >
                <Card className="overflow-hidden h-full">
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    {item.type && (
                      <div className="absolute top-3 left-3 bg-black/70 text-white p-2 rounded">
                        {getTypeIcon(item.type)}
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-sm">{item.title}</h3>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Policies and Procedures Section */}
        <div>
          <div className="mb-6">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-primary mb-2" data-testid="text-policies-header">
              POLICIES AND PROCEDURES
            </h3>
            <h2 className="text-2xl font-bold mb-4" data-testid="text-working-customers-title">
              Working with customers
            </h2>
            <p className="text-muted-foreground" data-testid="text-working-customers-description">
              Keep organizational, personal, and customer data secure.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {policiesItems.map((item, index) => (
              <div 
                key={index}
                className="hover-elevate"
                data-testid={`card-policy-item-${index}`}
              >
                <Card className="overflow-hidden h-full">
                  {item.isPolicyCard ? (
                    <div className="aspect-video relative overflow-hidden bg-green-500 flex items-center justify-center">
                      <span className="text-white text-3xl font-bold">POLICY</span>
                    </div>
                  ) : (
                    <div className="aspect-video relative overflow-hidden">
                      <img 
                        src={item.image!} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      {item.type && (
                        <div className="absolute top-3 left-3 bg-black/70 text-white p-2 rounded">
                          {getTypeIcon(item.type)}
                        </div>
                      )}
                    </div>
                  )}
                  <CardContent className="p-4">
                    <h3 className="font-medium text-sm">{item.title}</h3>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Essential Tools Section */}
        <div>
          <div className="mb-8">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-primary mb-2" data-testid="text-essential-tools-header">
              ESSENTIAL TOOLS
            </h3>
            <h2 className="text-2xl font-bold mb-4" data-testid="text-resources-software-title">
              Resources and software
            </h2>
            <p className="text-muted-foreground" data-testid="text-resources-software-description">
              Discover tools and resources that will help you work effectively.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {essentialToolsItems.map((item, index) => (
              <div 
                key={index}
                className="hover-elevate"
                data-testid={`card-essential-tool-${index}`}
              >
                <Card className="overflow-hidden h-full">
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    {item.type && (
                      <div className="absolute top-3 left-3 bg-black/70 text-white p-2 rounded">
                        {getTypeIcon(item.type)}
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-sm">{item.title}</h3>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* More Resources Section */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold mb-8" data-testid="text-more-resources-title">
            More resources
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {moreResourcesItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  size="lg"
                  className="h-auto p-4 text-left justify-start gap-3 border-primary-foreground/30 text-primary-foreground"
                  data-testid={`button-resource-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <IconComponent className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.title}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Engagement Stats */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" data-testid="button-like">
            <Heart className="w-4 h-4" />
            Like
          </Button>
          <div className="flex items-center gap-2" data-testid="text-views">
            <Eye className="w-4 h-4" />
            31 Views
          </div>
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" data-testid="button-save">
            <Bookmark className="w-4 h-4" />
            Save for later
          </Button>
        </div>
      </div>
    </div>
  );
}