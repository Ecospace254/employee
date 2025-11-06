import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus, 
  Grid3X3, 
  HelpCircle, 
  Share, 
  Copy, 
  FileDown, 
  FileText, 
  Settings, 
  MoreHorizontal,
  Filter,
  SortAsc,
  Eye,
  ChevronDown
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { ChecklistItem, InsertChecklistItem } from "@shared/schema";

export default function Checklist() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<InsertChecklistItem>>({
    work: "",
    description: "",
    relevantLink: "",
    relevantFiles: ""
  });

  const queryClient = useQueryClient();

  // Set page title for SEO
  useEffect(() => {
    document.title = "Employee Onboarding To Do Checklist | Internship";
    
    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Track your onboarding progress with our comprehensive checklist. Complete tasks, access resources, and connect with mentors.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Track your onboarding progress with our comprehensive checklist. Complete tasks, access resources, and connect with mentors.';
      document.getElementsByTagName('head')[0].appendChild(meta);
    }
  }, []);

  // Fetch checklist items
  const { data: checklistItems = [], isLoading } = useQuery<ChecklistItem[]>({
    queryKey: ["/api/checklist"],
  });

  // Fetch team members for mentors
  const { data: teamMembers = [] } = useQuery<any[]>({
    queryKey: ["/api/team-members"],
  });

  // Create checklist item mutation
  const createMutation = useMutation({
    mutationFn: (item: InsertChecklistItem) => apiRequest("POST", "/api/checklist", item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checklist"] });
      setIsAddDialogOpen(false);
      setNewItem({ work: "", description: "", relevantLink: "", relevantFiles: "" });
    },
  });

  // Update checklist item mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<InsertChecklistItem> }) =>
      apiRequest("PUT", `/api/checklist/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checklist"] });
    },
  });

  const handleAddItem = () => {
    if (newItem.work) {
      createMutation.mutate(newItem as InsertChecklistItem);
    }
  };

  const handleToggleComplete = (item: ChecklistItem) => {
    const updates = {
      completed: !item.completed,
      completedOn: !item.completed ? new Date() : null
    };
    updateMutation.mutate({ id: item.id, updates });
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString();
  };

  const getMentorName = (mentorId: string | null) => {
    if (!mentorId) return "";
    const mentor = teamMembers.find((member: any) => member.id === mentorId);
    return mentor ? `${mentor.firstName} ${mentor.lastName}` : "";
  };

  return (
    <div className="px-4 sm:px-6 py-4 sm:py-6">
      {/* SharePoint-style Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h1 className="text-xl sm:text-2xl font-semibold" data-testid="text-page-title">
              Employee Onboarding To Do Checklist
            </h1>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" data-testid="button-details">
                <Eye className="w-4 h-4 mr-2" />
                Details
              </Button>
            </div>
          </div>

          {/* SharePoint-style Control Bar */}
          <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/30 border rounded-md mb-4">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2" data-testid="button-add-new-item">
                  <Plus className="w-4 h-4" />
                  Add new item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Checklist Item</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="work">Work *</Label>
                    <Input
                      id="work"
                      value={newItem.work || ""}
                      onChange={(e) => setNewItem({ ...newItem, work: e.target.value })}
                      placeholder="Enter task title"
                      data-testid="input-work"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newItem.description || ""}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      placeholder="Enter task description"
                      data-testid="input-description"
                    />
                  </div>
                  <div>
                    <Label htmlFor="relevantLink">Relevant Link</Label>
                    <Input
                      id="relevantLink"
                      value={newItem.relevantLink || ""}
                      onChange={(e) => setNewItem({ ...newItem, relevantLink: e.target.value })}
                      placeholder="Enter relevant link URL"
                      data-testid="input-relevant-link"
                    />
                  </div>
                  <div>
                    <Label htmlFor="relevantFiles">Relevant Files</Label>
                    <Input
                      id="relevantFiles"
                      value={newItem.relevantFiles || ""}
                      onChange={(e) => setNewItem({ ...newItem, relevantFiles: e.target.value })}
                      placeholder="Enter relevant file names"
                      data-testid="input-relevant-files"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} data-testid="button-cancel">
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAddItem} 
                      disabled={!newItem.work || createMutation.isPending}
                      data-testid="button-save"
                    >
                      {createMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="ghost" size="sm" className="gap-1 sm:gap-2" data-testid="button-edit-grid-view">
              <Grid3X3 className="w-4 h-4" />
              <span className="hidden sm:inline">Edit grid view</span>
              <span className="sm:hidden">Edit</span>
            </Button>
            
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" className="gap-2" data-testid="button-help">
                <HelpCircle className="w-4 h-4" />
                Help
              </Button>
              
              <Button variant="ghost" size="sm" className="gap-2" data-testid="button-share">
                <Share className="w-4 h-4" />
                Share
              </Button>
              
              <Button variant="ghost" size="sm" className="gap-2" data-testid="button-export">
                <FileDown className="w-4 h-4" />
                Export
              </Button>
            </div>
            
            <div className="hidden lg:flex items-center gap-2">
              <Button variant="ghost" size="sm" className="gap-2" data-testid="button-copy-link">
                <Copy className="w-4 h-4" />
                Copy link
              </Button>
              
              <Button variant="ghost" size="sm" className="gap-2" data-testid="button-forms">
                <FileText className="w-4 h-4" />
                Forms
              </Button>
              
              <Button variant="ghost" size="sm" className="gap-2" data-testid="button-automate">
                <Settings className="w-4 h-4" />
                Automate
              </Button>
              
              <Button variant="ghost" size="sm" className="gap-2" data-testid="button-integrate">
                <MoreHorizontal className="w-4 h-4" />
                Integrate
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* View Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 text-sm">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <Button variant="ghost" size="sm" className="gap-2" data-testid="button-filter">
                <Filter className="w-4 h-4" />
                All Items
                <ChevronDown className="w-4 h-4" />
              </Button>
              <div className="hidden lg:flex items-center gap-4 text-muted-foreground text-xs">
                <span>Group work by completed by date</span>
                <span>Group work by completion status</span>
                <span>Work to be completed</span>
              </div>
              <Button variant="ghost" size="sm" className="gap-1 sm:gap-2" data-testid="button-add-view">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add view</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Checklist Table */}
        <Card>
          <CardContent className="p-0">
            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="w-8"></TableHead>
                    <TableHead className="cursor-pointer" data-testid="header-work">
                      <div className="flex items-center gap-2">
                        Work
                        <SortAsc className="w-4 h-4" />
                      </div>
                    </TableHead>
                    <TableHead data-testid="header-description">Description</TableHead>
                    <TableHead data-testid="header-complete-by">Complete by</TableHead>
                    <TableHead data-testid="header-completed">Completed</TableHead>
                    <TableHead data-testid="header-completed-on">Completed on</TableHead>
                    <TableHead data-testid="header-mentor">Mentor</TableHead>
                    <TableHead data-testid="header-relevant-link">Relevant link</TableHead>
                    <TableHead data-testid="header-relevant-files">Relevant files</TableHead>
                    <TableHead className="w-20" data-testid="header-add-column">Add column</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        Loading checklist items...
                      </TableCell>
                    </TableRow>
                  ) : checklistItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                        No checklist items found. Add your first item above.
                      </TableCell>
                    </TableRow>
                  ) : (
                    checklistItems.map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/20" data-testid={`row-checklist-item-${item.id}`}>
                        <TableCell>
                          <Checkbox
                            checked={item.completed || false}
                            onCheckedChange={() => handleToggleComplete(item)}
                            data-testid={`checkbox-complete-${item.id}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium" data-testid={`cell-work-${item.id}`}>
                          {item.work}
                        </TableCell>
                        <TableCell className="max-w-xs truncate" data-testid={`cell-description-${item.id}`}>
                          {item.description}
                        </TableCell>
                        <TableCell data-testid={`cell-complete-by-${item.id}`}>
                          {formatDate(item.completeBy)}
                        </TableCell>
                        <TableCell data-testid={`cell-completed-${item.id}`}>
                          {item.completed ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Done
                            </Badge>
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell data-testid={`cell-completed-on-${item.id}`}>
                          {formatDate(item.completedOn)}
                        </TableCell>
                        <TableCell data-testid={`cell-mentor-${item.id}`}>
                          {getMentorName(item.mentorId)}
                        </TableCell>
                        <TableCell data-testid={`cell-relevant-link-${item.id}`}>
                          {item.relevantLink && (
                            <a 
                              href={item.relevantLink} 
                              className="text-blue-600 hover:underline" 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              Link
                            </a>
                          )}
                        </TableCell>
                        <TableCell data-testid={`cell-relevant-files-${item.id}`}>
                          {item.relevantFiles}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y">
              {isLoading ? (
                <div className="text-center py-8">
                  Loading checklist items...
                </div>
              ) : checklistItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No checklist items found. Add your first item above.
                </div>
              ) : (
                checklistItems.map((item) => (
                  <div key={item.id} className="p-4 space-y-3" data-testid={`row-checklist-item-${item.id}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Checkbox
                          checked={item.completed || false}
                          onCheckedChange={() => handleToggleComplete(item)}
                          data-testid={`checkbox-complete-${item.id}`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground" data-testid={`cell-work-${item.id}`}>
                            {item.work}
                          </div>
                          {item.description && (
                            <div className="text-sm text-muted-foreground mt-1" data-testid={`cell-description-${item.id}`}>
                              {item.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <div data-testid={`cell-completed-${item.id}`}>
                        {item.completed ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Done
                          </Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground ml-8">
                      {item.completeBy && (
                        <div>
                          <span className="font-medium">Complete by:</span> {formatDate(item.completeBy)}
                        </div>
                      )}
                      {item.completedOn && (
                        <div>
                          <span className="font-medium">Completed on:</span> {formatDate(item.completedOn)}
                        </div>
                      )}
                      {item.mentorId && (
                        <div>
                          <span className="font-medium">Mentor:</span> {getMentorName(item.mentorId)}
                        </div>
                      )}
                      {item.relevantLink && (
                        <div data-testid={`cell-relevant-link-${item.id}`}>
                          <span className="font-medium">Link:</span> {" "}
                          <a 
                            href={item.relevantLink} 
                            className="text-blue-600 hover:underline" 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            View Link
                          </a>
                        </div>
                      )}
                      {item.relevantFiles && (
                        <div data-testid={`cell-relevant-files-${item.id}`}>
                          <span className="font-medium">Files:</span> {item.relevantFiles}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Add New Items Link */}
        <div className="mt-4">
          <Button 
            variant="ghost" 
            className="gap-2 p-0 h-auto text-blue-600 hover:text-blue-800" 
            onClick={() => setIsAddDialogOpen(true)}
            data-testid="link-add-new-items"
          >
            <Plus className="w-4 h-4" />
            Add new items
          </Button>
        </div>
      </div>
  );
}