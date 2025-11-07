import { motion } from "motion/react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import checklistImage from "@assets/generated_images/Checklist_planning_workspace_f9ac52dc.png";
import trainingImage from "@assets/generated_images/Corporate_training_room_ba0873c1.png";
import resourcesImage from "@assets/generated_images/Business_resources_workspace_2bbe77f0.png";
import path from "path";

export default function ActionCards() {
  const [, setLocation] = useLocation();

  const cards = [
    {
      id: "checklist",
      title: "Use the checklist",
      description: "Use the onboarding checklist as your guide to the first 30 days.",
      image: checklistImage,
      buttonText: "View the checklist",
      path: "/Checklist",
      testId: "button-view-checklist"
    },
    {
      id: "learning",
      title: "Start learning",
      description: "Find learning opportunities in the digital training library.",
      image: trainingImage,
      buttonText: "Get started",
      path: "/Training",
      testId: "button-get-started"
    },
    {
      id: "resources",
      title: "Review resources",
      description: "Check out resources, documents, and forms.",
      image: resourcesImage,
      buttonText: "Learn more",
      path: "/Documents",
      testId: "button-learn-more"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:my-8">
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: index * 0.3,
            ease: "easeOut"
          }}
        >
          <Card className="h-full hover-elevate dark:bg-slate-800">
            <CardContent className="p-0">
              <div className="h-48 overflow-hidden rounded-t-lg">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover"
                  data-testid={`img-${card.id}`}
                />
              </div>
              <div className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-foreground" data-testid={`text-${card.id}-title`}>
                  {card.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`text-${card.id}-description`}>
                  {card.description}
                </p>
                <Button
                  onClick={() => setLocation(card.path)}
                  className="w-full"
                  data-testid={card.testId}
                >
                  {card.buttonText}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      ))}
    </div>
  );
}