import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, Calculator, Megaphone, GraduationCap, Code, DollarSign, TrendingUp, Heart, Eye, Bookmark, UsersRound, HeartHandshake, Handshake, HandHeart } from "lucide-react";
import { motion } from "motion/react";

// Import stock images
import heroImage from "@assets/stock_images/team_collaboration_m_50dd010c.jpg";
import diversityImage from "@assets/stock_images/diverse_team_hands_t_070ee7f7.jpg";
import lgbtqImage from "@assets/stock_images/lgbtq_pride_flags_di_37e2a4ea.jpg";
import mindfulnessImage from "@assets/stock_images/mindfulness_meditati_97a4ce9c.jpg";
import environmentalImage from "@assets/stock_images/environmental_sustai_d16d3191.jpg";
import womeninspaceImage from "@assets/stock_images/WomenInSpace.jpg";

export default function HowWeWork() {
  // Set page title for SEO
  useEffect(() => {
    document.title = "How We Work - Company Culture & Values | Internship";
    
    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Discover our company culture, values, and how we work together. Learn about our commitment to diversity, collaboration, and community impact.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Discover our company culture, values, and how we work together. Learn about our commitment to diversity, collaboration, and community impact.';
      document.getElementsByTagName('head')[0].appendChild(meta);
    }
  }, []);
  const teams = [
    { name: "Management", icon: Users },
    { name: "The Sky Team", icon: Users },
    { name: "Admin & Finance", icon: Calculator },
    { name: "Marketing", icon: Megaphone },
    { name: "Training & Services", icon: GraduationCap },
    { name: "Dev", icon: Code },
    { name: "Finance", icon: DollarSign },
    { name: "Sales", icon: TrendingUp }
  ];

  const cultureValues = [
    {
      title: "Diversity and inclusion",
      description: "Our priority is to establish a sense of belonging for everyone so that you can bring your best self to work.",
      icon: UsersRound
    },
    {
      title: "People and the greater good",
      description: "Our work becomes more meaningful when we know it aims to help people and the quality of life for our community.",
      icon: HeartHandshake
    },
    {
      title: "Collaboration and teamwork",
      description: "Some say 'teamwork makes the dream work' and we agree. Complex problems require teams of empowered people.",
      icon: Handshake
    },
    {
      title: "Community and giving back",
      description: "Investing in our communities is our way of uplifting the people, organizations, and businesses that make our work possible.",
      icon: HandHeart
    }
  ];

  const socialClubs = [
    {
      title: "Women in Space Kenya",
      image: womeninspaceImage,
      description: "Supporting women who aspire to advance in their careers in the space industry"
    },
    {
      title: "Environmental Policy Reform",
      image: environmentalImage,
      description: "Working towards sustainable environmental practices"
    },
    {
      title: "Racial Equality",
      image: diversityImage,
      description: "Promoting racial equality and justice in the workplace"
    },
    {
      title: "LGBTQIA+ Employees and Allies",
      image: lgbtqImage,
      description: "Supporting LGBTQIA+ community and creating inclusive environment"
    },
    {
      title: "Mindfulness and Self-Care",
      image: mindfulnessImage,
      description: "Focusing on mental health and wellness practices"
    }
    
  ];

  return (
    <div>
      {/* Hero Section */}
      <div className="relative h-80 overflow-hidden">
        <img 
          src={heroImage} 
          alt="Team collaboration" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-white" data-testid="text-page-title">
            How we work
          </h1>
        </div>
      </div>

      {/* Culture & Values Section */}
      <div className="bg-primary dark:bg-slate-800 text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold tracking-wider uppercase text-primary-foreground/80 mb-4" data-testid="text-section-header">
              OUR CULTURE & VALUES
            </h2>
            <blockquote className="text-lg italic mb-4" data-testid="text-culture-quote">
                "Building our culture is a core priority for us"
              </blockquote>
              <cite className="text-primary-foreground/90 font-semibold" data-testid="text-quote-author">
                - Patti Fernandez
              </cite>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {cultureValues.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.3
                }}
              >
                <Card className="h-full bg-card/90 ">
                  <CardContent className="pt-6">
                    <div className="mb-4">
                      <value.icon className="w-10 h-10 text-primary mx-auto" />
                    </div>
                    <h3 className="text-lg text-center font-bold mb-3">
                      {value.title}
                    </h3>
                    <p className="leading-relaxed text-left text-sm">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Explore Other Teams Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl text-center font-semibold tracking-wider mb-8" data-testid="text-teams-title">
          EXPLORE OTHER TEAMS
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-16">
          {teams.map((team, index) => {
            const IconComponent = team.icon;
            return (
              <Card 
                key={index} 
                className="hover-elevate h-full dark:bg-slate-800"
                data-testid={`card-team-${team.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <IconComponent className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">{team.name}</span>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Employee Resource Groups */}
        <div>
          <div className="mb-6">
            <h3 className="text-2xl font-semibold text-center tracking-wider uppercase mb-2" data-testid="text-erg-header">
              EMPLOYEE RESOURCE GROUPS
            </h3>
            <h2 className="text-xl font-bold mb-4" data-testid="text-social-clubs-title">
              Social clubs and causes
            </h2>
            <p className="text-muted-foreground max-w-2xl" data-testid="text-social-clubs-description">
              Start meeting new people, networking, and getting involved in causes that you care about. Attend an upcoming employee resource group event to learn more about different clubs, causes, and how you can make a difference.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
            {socialClubs.map((club, index) => (
              <div 
                key={index} 
                className="hover-elevate cursor-pointer"
                data-testid={`card-social-club-${club.title.toLowerCase().replace(/\s+/g, '-').replace(/\+/g, 'plus')}`}
              >
                <Card className="overflow-hidden h-full dark:bg-slate-800">
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={club.image} 
                      alt={club.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-center text-sm mb-2">{club.title}</h3>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Engagement Stats */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" data-testid="button-like">
              <Heart className="w-4 h-4" />
              Like
            </Button>
            <div className="flex items-center gap-2" data-testid="text-views">
              <Eye className="w-4 h-4" />
              20 Views
            </div>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" data-testid="button-save">
              <Bookmark className="w-4 h-4" />
              Save for later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}