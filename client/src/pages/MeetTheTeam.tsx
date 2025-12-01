import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Building2, MessageCircle, Eye } from "lucide-react";
import { PublicUser } from "@shared/schema";
import OrganizationalChart from "@/components/meet-the-team/OrganizationalChart";

export default function MeetTheTeam() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  const { data: teamMembers = [], isLoading } = useQuery<PublicUser[]>({
    queryKey: ["/api/team-members"],
  });

  const departments = Array.from(new Set(teamMembers.map(m => m.department).filter((dept): dept is string => Boolean(dept))));
  const filteredMembers = selectedDepartment === "all" 
    ? teamMembers 
    : teamMembers.filter(m => m.department === selectedDepartment);

  const leadership = teamMembers.filter(member => 
    member.role === "hr" || member.jobTitle?.toLowerCase().includes("director") || 
    member.jobTitle?.toLowerCase().includes("manager")
  );

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 py-8">
        <div className="text-center">Loading team information...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <div 
        className="relative h-64 sm:h-80 lg:h-96 bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1200 400\"><rect fill=\"%23f8f9fa\" width=\"1200\" height=\"400\"/><rect fill=\"%23e9ecef\" x=\"100\" y=\"50\" width=\"300\" height=\"200\"/><rect fill=\"%23dee2e6\" x=\"450\" y=\"80\" width=\"250\" height=\"150\"/><rect fill=\"%23ced4da\" x=\"750\" y=\"60\" width=\"350\" height=\"180\"/></svg>')"
        }}
      >
        <div className="text-center text-white px-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4" data-testid="text-hero-title">
            Meet the team
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-white/90">
            Discover the talented individuals who make our organization successful
          </p>
        </div>
      </div>

      {/* Leadership Message Section */}
      <div className="bg-primary dark:bg-slate-800 py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="text-primary-foreground">
                <div className="space-y-4 text-primary-foreground/90 mb-4">
                  <p className="text-justify text-xl leading-relaxed">
                    It's my pleasure to extend a warm welcome to each of you as you prepare to join Ecospace 
                    Services Ltd. This is an environment where we value empowering our employees to make an impact.
                  </p>
                  
                  <p className="text-justify text-xl leading-relaxed">
                    Use this opportunity to pursue whatever drives your passion. We continue to grow as a 
                    company and attract new customers due to our ability to listen, pivot, and explore new solutions.
                  </p>
                </div>
                <blockquote className="text-lg italic leading-relaxed mb-4">
                  "The world changes when we change our perspective."
                </blockquote>
                
              </div>
              
              <div className="flex justify-center">
                <Card className="h-full dark:bg-slate-800">
                  <CardContent className="p-16 text-center">
                    <Avatar className="w-32 h-32 mx-auto mb-4">
                      <AvatarFallback className="text-2xl bg-primary-foreground/10">
                        FA
                      </AvatarFallback>
                    </Avatar>
                    <h4 className="font-semibold text-lg">Fred Awiti, MD</h4>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Directory Section */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
        <Tabs defaultValue="directory" className="space-y-8">
          <div className="text-center">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
              <TabsTrigger value="directory" data-testid="tab-directory">
                <Users className="w-4 h-4 mr-2" />
                Directory
              </TabsTrigger>
              <TabsTrigger value="org-chart" data-testid="tab-org-chart">
                <Building2 className="w-4 h-4 mr-2" />
                Org Chart
              </TabsTrigger>
              <TabsTrigger value="introductions" data-testid="tab-introductions">
                <MessageCircle className="w-4 h-4 mr-2" />
                Introductions
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="directory" className="space-y-8">
            {/* Leadership Section */}
            {leadership.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6" data-testid="text-leadership-title">
                  Meet the Research & Development team leaders
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {leadership.map((member) => (
                    <Card key={member.id} className="hover-elevate dark:bg-slate-800 transition-all duration-200" data-testid={`card-leader-${member.id}`}>
                      <CardContent className="p-6 text-center">
                        <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-background shadow-lg">
                          <AvatarImage src={member.profileImage || undefined} />
                          <AvatarFallback className="text-lg bg-primary-foreground/10">
                            {getInitials(member.firstName, member.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <h3 className="font-semibold text-lg mb-1" data-testid={`text-leader-name-${member.id}`}>
                          {member.firstName} {member.lastName}
                        </h3>
                        
                        <p className="text-sm text-muted-foreground mb-2" data-testid={`text-leader-title-${member.id}`}>
                          {member.jobTitle || member.role}
                        </p>
                        
                        {member.department && (
                          <Badge variant="secondary" className="text-xs">
                            {member.department}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Department Filter */}
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant={selectedDepartment === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDepartment("all")}
                data-testid="button-filter-all"
              >
                All Departments
              </Button>
              {departments.map((dept) => (
                <Button
                  key={dept}
                  variant={selectedDepartment === dept ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDepartment(dept)}
                  data-testid={`button-filter-${dept}`}
                >
                  {dept}
                </Button>
              ))}
            </div>

            {/* All Team Members */}
            <div>
              <h2 className="text-2xl font-bold mb-6" data-testid="text-team-title">
                {selectedDepartment === "all" ? "All Team Members" : `${selectedDepartment} Team`}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMembers.map((member) => (
                  <Card key={member.id} className="hover-elevate transition-all duration-200 dark:bg-slate-800" data-testid={`card-member-${member.id}`}>
                    <CardContent className="p-6 text-center">
                      <Avatar className="w-20 h-20 mx-auto mb-4">
                        <AvatarImage src={member.profileImage || undefined} />
                        <AvatarFallback className="bg-primary-foreground/10">
                          {getInitials(member.firstName, member.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <h3 className="font-semibold mb-1" data-testid={`text-member-name-${member.id}`}>
                        {member.firstName} {member.lastName}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground mb-2" data-testid={`text-member-title-${member.id}`}>
                        {member.jobTitle || member.role}
                      </p>
                      
                      {member.department && (
                        <Badge variant="secondary" className="text-xs">
                          {member.department}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="org-chart" className="space-y-8">
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-4">Interactive Organizational Structure</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Explore our organizational hierarchy. Click the expand/collapse buttons on each position 
                  to view reporting structures. Use your mouse wheel to zoom in and out, or drag to navigate 
                  through the chart.
                </p>
              </div>
              <OrganizationalChart />
            </div>
          </TabsContent>

          <TabsContent value="introductions" className="space-y-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-4">We want to get to know you!</h2>
                <p className="text-muted-foreground">
                  Follow the instructions here to make your arrival known in an "About me" news post that 
                  will be shared with the R&D organization.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Step 1 & 2 */}
                <Card className="dark:bg-slate-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                      Create News Post
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      On the Home page, in the upper left corner of the command bar, select + New, and select News post.
                    </p>
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="bg-primary h-8 w-full rounded mb-2"></div>
                      <div className="space-y-2">
                        <div className="bg-background h-4 w-3/4 rounded"></div>
                        <div className="bg-background h-4 w-1/2 rounded"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Step 3 & 4 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                      Share Your Story
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Share a brief introduction, a picture of yourself, and your new role. Save as draft, 
                      and when you are ready to share, select Post news.
                    </p>
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex gap-4">
                        <div className="bg-primary w-16 h-16 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="bg-background h-4 w-full rounded"></div>
                          <div className="bg-background h-4 w-3/4 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center mt-8">
                <Button className="gap-2" data-testid="button-create-introduction">
                  <MessageCircle className="w-4 h-4" />
                  Create Your Introduction
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}