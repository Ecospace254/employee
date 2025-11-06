import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Folder, FileText, MoreHorizontal, Plus, Upload, Edit, Grid, LayoutList } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface Document {
  id: string;
  name: string;
  type: "folder" | "file";
  modified: string;
  modifiedBy: string;
  size?: string;
}

export default function Documents() {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  
  const documents: Document[] = [
    {
      id: "1",
      name: "01 Company Policies",
      type: "folder",
      modified: "February 14",
      modifiedBy: "Test Auth"
    },
    {
      id: "2", 
      name: "02 Job & Internship Applications",
      type: "folder",
      modified: "December 2, 2024",
      modifiedBy: "Employee Services HR"
    },
    {
      id: "3",
      name: "03 Staff Course Development", 
      type: "folder",
      modified: "December 2, 2024",
      modifiedBy: "Employee Services HR"
    },
    {
      id: "4",
      name: "04 Reports",
      type: "folder", 
      modified: "November 6, 2024",
      modifiedBy: "Employee Services HR"
    }
  ];

  const getIcon = (type: "folder" | "file") => {
    return type === "folder" ? (
      <Folder className="w-4 h-4 text-blue-600" />
    ) : (
      <FileText className="w-4 h-4 text-gray-600" />
    );
  };

  return (
    <div className="px-4 sm:px-6 py-4 sm:py-8">
      {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground" data-testid="text-documents-title">
                Documents
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Access important company documents and resources
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" data-testid="button-view-grid">
                <Grid className="w-4 h-4" />
                <span className="sr-only">Grid view</span>
              </Button>
              <Button variant="outline" size="sm" data-testid="button-view-list">
                <LayoutList className="w-4 h-4" />
                <span className="sr-only">List view</span>
              </Button>
            </div>
          </div>
          
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="default" size="sm" className="gap-2" data-testid="button-new-document">
                <Plus className="w-4 h-4" />
                New
              </Button>
              <Button variant="outline" size="sm" className="gap-2" data-testid="button-upload">
                <Upload className="w-4 h-4" />
                Upload
              </Button>
              <Button variant="outline" size="sm" className="gap-1 sm:gap-2" data-testid="button-edit-grid">
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Edit grid view</span>
                <span className="sm:hidden">Edit</span>
              </Button>
            </div>
            <div className="hidden lg:flex ml-auto items-center gap-4 text-sm text-muted-foreground">
              <span>Help</span>
              <span>Share</span>
              <span>Copy link</span>
              <span>Export</span>
            </div>
          </div>
        </div>

        {/* Documents List */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Folder className="w-5 h-5 text-blue-600" />
                Documents
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                {documents.length} items
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Table Header - Desktop */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b bg-muted/30 text-sm font-medium text-muted-foreground">
              <div className="col-span-6 flex items-center gap-2">
                <span>Name</span>
              </div>
              <div className="col-span-2">Modified</div>
              <div className="col-span-3">Modified by</div>
              <div className="col-span-1 text-center">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  Add column
                </Button>
              </div>
            </div>
            
            {/* Documents List */}
            <div className="divide-y">
              {documents.map((doc) => (
                <div key={doc.id} data-testid={`row-document-${doc.id}`}>
                  {/* Desktop Layout */}
                  <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 hover:bg-muted/30 transition-colors cursor-pointer group">
                    <div className="col-span-6 flex items-center gap-3">
                      {getIcon(doc.type)}
                      <span className="font-medium text-blue-600 hover:underline" data-testid={`text-document-name-${doc.id}`}>
                        {doc.name}
                      </span>
                    </div>
                    <div className="col-span-2 text-sm text-muted-foreground" data-testid={`text-modified-${doc.id}`}>
                      {doc.modified}
                    </div>
                    <div className="col-span-3 text-sm text-muted-foreground" data-testid={`text-modified-by-${doc.id}`}>
                      {doc.modifiedBy}
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" data-testid={`button-more-${doc.id}`}>
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Open</DropdownMenuItem>
                          <DropdownMenuItem>Share</DropdownMenuItem>
                          <DropdownMenuItem>Download</DropdownMenuItem>
                          <DropdownMenuItem>Properties</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Mobile Layout */}
                  <div className="md:hidden p-4 hover:bg-muted/30 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {getIcon(doc.type)}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-blue-600 hover:underline truncate" data-testid={`text-document-name-${doc.id}`}>
                            {doc.name}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            <div>Modified {doc.modified}</div>
                            <div>by {doc.modifiedBy}</div>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" data-testid={`button-more-${doc.id}`}>
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Open</DropdownMenuItem>
                          <DropdownMenuItem>Share</DropdownMenuItem>
                          <DropdownMenuItem>Download</DropdownMenuItem>
                          <DropdownMenuItem>Properties</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Empty State for when no documents */}
        {documents.length === 0 && (
          <div className="text-center py-12">
            <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No documents yet</h3>
            <p className="text-muted-foreground mb-4">
              Upload or create your first document to get started.
            </p>
            <Button className="gap-2" data-testid="button-upload-first">
              <Upload className="w-4 h-4" />
              Upload document
            </Button>
          </div>
        )}
      </div>
  );
}