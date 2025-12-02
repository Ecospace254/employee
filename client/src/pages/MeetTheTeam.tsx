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
import teamBackground from "@assets/MeetTeamBackground.jpg";
import { departments } from "@/data/departments";
import { filterUsersByDepartment, getDepartmentMemberCount, groupUsersByDepartment } from "@/utils/departmentHelpers";

export default function MeetTheTeam() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  const { data: teamMembers = [], isLoading } = useQuery<PublicUser[]>({
    queryKey: ["/api/team-members"],
  });

  // Group members by department
  const membersByDepartment = groupUsersByDepartment(teamMembers);

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
      {/* Hero Section */}
<div className="relative h-64 sm:h-80 lg:h-96 flex items-center justify-center overflow-hidden">
  {/* Background Image */}
  <img 
    src={teamBackground} 
    alt="Team background" 
    className="absolute inset-0 w-full h-full object-cover"
  />
  
  {/* Dark Overlay */}
  <div className="absolute inset-0 bg-black/60"></div>
  
  {/* Content */}
  <div className="relative z-10 text-center text-white px-4">
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
                Departments
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
            {/* Department Tabs */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full justify-center overflow-x-auto flex-wrap h-auto gap-2 bg-transparent p-2">
                <TabsTrigger 
                  value="all" 
                  className="whitespace-nowrap bg-blue-50 hover:bg-blue-100 data-[state=active]:bg-blue-600 data-[state=active]:text-white border border-blue-200 data-[state=active]:border-blue-600 transition-all"
                >
                  All Departments ({teamMembers.length})
                </TabsTrigger>
                {departments.map((dept, index) => {
                  const count = getDepartmentMemberCount(teamMembers, dept.name);
                  const blueShades = [
                    "bg-blue-100 hover:bg-blue-200",
                    "bg-sky-100 hover:bg-sky-200",
                    "bg-cyan-100 hover:bg-cyan-200",
                    "bg-blue-50 hover:bg-blue-150",
                    "bg-indigo-100 hover:bg-indigo-200",
                    "bg-sky-50 hover:bg-sky-150",
                    "bg-cyan-50 hover:bg-cyan-150"
                  ];
                  const shadeClass = blueShades[index % blueShades.length];
                  return (
                    <TabsTrigger 
                      key={dept.id} 
                      value={dept.id} 
                      className={`whitespace-nowrap ${shadeClass} data-[state=active]:bg-blue-600 data-[state=active]:text-white border border-blue-200 data-[state=active]:border-blue-600 transition-all`}
                    >
                      {dept.name} ({count})
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {/* All Departments Tab - Grouped by Department */}
              <TabsContent value="all" className="space-y-8 mt-6">
                {departments.map((dept) => {
                  const deptMembers = membersByDepartment[dept.name] || [];
                  if (deptMembers.length === 0) return null;
                  
                  return (
                    <div key={dept.id}>
                      <h2 className="text-2xl font-bold mb-6">
                        {dept.name}
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {deptMembers.map((member, index) => {
                          const blueShades = [
                            "bg-blue-50 dark:bg-blue-950/30",
                            "bg-sky-50 dark:bg-sky-950/30",
                            "bg-cyan-50 dark:bg-cyan-950/30",
                            "bg-indigo-50 dark:bg-indigo-950/30",
                            "bg-blue-100 dark:bg-blue-900/30",
                            "bg-sky-100 dark:bg-sky-900/30",
                            "bg-cyan-100 dark:bg-cyan-900/30"
                          ];
                          const cardBg = blueShades[index % blueShades.length];
                          return (
                            <Card key={member.id} className={`hover-elevate transition-all duration-200 ${cardBg} border-blue-200 dark:border-blue-800`} data-testid={`card-member-${member.id}`}>
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
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </TabsContent>

              {/* Individual Department Tabs */}
              {departments.map((dept) => {
                const deptMembers = membersByDepartment[dept.name] || [];
                
                return (
                  <TabsContent key={dept.id} value={dept.id} className="mt-6">
                    <h2 className="text-2xl font-bold mb-6">
                      {dept.name} Team
                    </h2>
                    {deptMembers.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {deptMembers.map((member, index) => {
                          const blueShades = [
                            "bg-blue-50 dark:bg-blue-950/30",
                            "bg-sky-50 dark:bg-sky-950/30",
                            "bg-cyan-50 dark:bg-cyan-950/30",
                            "bg-indigo-50 dark:bg-indigo-950/30",
                            "bg-blue-100 dark:bg-blue-900/30",
                            "bg-sky-100 dark:bg-sky-900/30",
                            "bg-cyan-100 dark:bg-cyan-900/30"
                          ];
                          const cardBg = blueShades[index % blueShades.length];
                          return (
                            <Card key={member.id} className={`hover-elevate transition-all duration-200 ${cardBg} border-blue-200 dark:border-blue-800`} data-testid={`card-member-${member.id}`}>
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
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No team members in this department yet.</p>
                      </div>
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
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