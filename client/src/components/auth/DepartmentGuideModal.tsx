import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { departments } from "@/data/departments";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

interface DepartmentGuideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const departmentConfig = [
  { gradient: "from-purple-500/90 to-purple-600/90 dark:from-purple-600/80 dark:to-purple-700/80" },
  { gradient: "from-blue-500/90 to-blue-600/90 dark:from-blue-600/80 dark:to-blue-700/80" },
  { gradient: "from-emerald-500/90 to-emerald-600/90 dark:from-emerald-600/80 dark:to-emerald-700/80" },
  { gradient: "from-orange-500/90 to-orange-600/90 dark:from-orange-600/80 dark:to-orange-700/80" },
  { gradient: "from-teal-500/90 to-teal-600/90 dark:from-teal-600/80 dark:to-teal-700/80" },
  { gradient: "from-pink-500/90 to-pink-600/90 dark:from-pink-600/80 dark:to-pink-700/80" },
  { gradient: "from-indigo-500/90 to-indigo-600/90 dark:from-indigo-600/80 dark:to-indigo-700/80" },
];

export function DepartmentGuideModal({ open, onOpenChange }: DepartmentGuideModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto bg-background/90">
        <DialogHeader>
          <DialogTitle className="text-2xl">Department & Role Guide</DialogTitle>
          <DialogDescription>
            Browse all departments and their roles to find where you belong in our organization.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {departments.map((dept, index) => {
            return (
              <Card
                key={dept.id}
                className="group cursor-pointer overflow-hidden border-border/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full"
              >
                <CardContent className="p-0 h-full">
                  <div className={`relative bg-gradient-to-br ${departmentConfig[index].gradient} p-5 h-full min-h-[280px] flex flex-col`}>
                    {/* Decorative background pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12" />
                    </div>

                    {/* Department Name and Badge Row */}
                    <div className="relative flex items-start justify-between mb-4">
                      <h3 className="text-white font-bold text-lg leading-tight flex-1">
                        {dept.name}
                      </h3>
                      <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm ml-2">
                        {dept.roles.length}
                      </Badge>
                    </div>

                    {/* Roles List */}
                    <div className="relative flex-1 overflow-y-auto">
                      <ul className="space-y-2">
                        {dept.roles.map((role, roleIndex) => (
                          <li key={roleIndex} className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-emerald-300 flex-shrink-0 mt-0.5" />
                            <span className="text-white/90 leading-snug">{role}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> If you're unsure about your role or it's not listed, please contact HR for assistance.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
