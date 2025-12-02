import { motion } from "motion/react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import {
  Newspaper,
  Users,
  Clock,
  HelpCircle,
  CreditCard,
  Heart,
  GraduationCap,
  UserCheck
} from "lucide-react";

export default function PopularPortals() {
  const [, setLocation] = useLocation();

  const portals = [
    {
      id: "company-news",
      title: "Company news",
      description: "Stay up to date on news and announcements",
      icon: Newspaper,
      onClick: () => setLocation("/news-announcements")
    },
    {
      id: "employee-directory",
      title: "Employee directory",
      description: "View professional profiles and organizational structure",
      icon: Users,
      onClick: () => console.log("Employee directory clicked")
    },
    {
      id: "paid-time-off",
      title: "Paid time off",
      description: "Review paid time off policies and submit vacation requests",
      icon: Clock,
      onClick: () => console.log("Paid time off clicked")
    },
    {
      id: "it-helpdesk",
      title: "IT Helpdesk",
      description: "Get help troubleshooting and ordering hardware",
      icon: HelpCircle,
      onClick: () => console.log("IT Helpdesk clicked")
    },
    {
      id: "payroll",
      title: "Payroll",
      description: "Set up direct deposit and access pay history",
      icon: CreditCard,
      onClick: () => console.log("Payroll clicked")
    },
    {
      id: "benefits",
      title: "Benefits",
      description: "Access information about health and wellness benefits",
      icon: Heart,
      onClick: () => console.log("Benefits clicked")
    },
    {
      id: "training-portal",
      title: "Training portal",
      description: "Find learning and training opportunities",
      icon: GraduationCap,
      onClick: () => setLocation("/Training")
    },
    {
      id: "employee-resource-groups",
      title: "Employee resource groups",
      description: "Connect and grow with your colleagues",
      icon: UserCheck,
      onClick: () => console.log("Employee resource groups clicked")
    }
  ];

  return (
    <div className="my-12">
      <h2 className="text-xl font-semibold text-foreground mb-6" data-testid="text-portals-title">
        Popular portals
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {portals.map((portal, index) => {
          const IconComponent = portal.icon;
          return (
            <motion.div
              key={portal.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.03 }}
              transition={{
                duration: 0.8,
                delay: index * 0.3
              }}
            >
              <Card
                className="h-full hover-elevate cursor-pointer transition-colors dark:bg-slate-800"
                onClick={portal.onClick}
                data-testid={`card-portal-${portal.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-foreground mb-1" data-testid={`text-portal-${portal.id}-title`}>
                        {portal.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed" data-testid={`text-portal-${portal.id}-description`}>
                        {portal.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

          );
        })}
      </div>
    </div>
  );
}