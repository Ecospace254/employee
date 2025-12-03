import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Building2, MessageCircle, Eye, Plus, Newspaper, Megaphone, ArrowRight } from "lucide-react";
import { PublicUser } from "@shared/schema";
import OrganizationalChart from "@/components/meet-the-team/OrganizationalChart";
import teamBackground from "@assets/MeetTeamBackground.jpg";
import { departments } from "@/data/departments";
import { filterUsersByDepartment, getDepartmentMemberCount, groupUsersByDepartment } from "@/utils/departmentHelpers";
import CreateAnnouncementModal from "@/components/announcements/CreateAnnouncementModal";
import { useLocation } from "wouter";

type Announcement = {
  id: string;
  title: string;
  content: string;
  type: 'news' | 'announcement' | 'introduction';
  imageUrl: string | null;
  mediaLink: string | null;
  authorId: string;
  viewCount: number;
  likeCount: number;
  publishedAt: string;
  metadata: string | null;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage: string | null;
    jobTitle?: string;
    department?: string;
  };
};

export default function MeetTheTeam() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createType, setCreateType] = useState<'news' | 'announcement' | 'introduction'>('introduction');
  const [, setLocation] = useLocation();

  const { data: teamMembers = [], isLoading } = useQuery<PublicUser[]>({
    queryKey: ["/api/team-members"],
  });

  // Fetch recent introductions
  const { data: announcements = [] } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
    queryFn: async () => {
      const response = await fetch(`/api/announcements`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch");
      return response.json();
    },
  });

  const recentIntroductions = announcements
    .filter(a => a.type === 'introduction')
    .slice(0, 3);
  const introductionsCount = announcements.filter(a => a.type === 'introduction').length;

  // Group members by department
  const membersByDepartment = groupUsersByDepartment(teamMembers);

  // Handler functions
  const handleCreateIntroduction = () => {
    setCreateType('introduction');
    setIsCreateModalOpen(true);
  };

  const handleViewIntroductions = () => {
    setLocation('/company-hub?tab=introduction');
  };

  const handleCreatePost = (type: 'news' | 'announcement') => {
    setCreateType(type);
    setIsCreateModalOpen(true);
  };

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
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  We want to get to know you!
                </h2>
                <p className="text-muted-foreground text-lg">
                  Share your story with the team and learn about your colleagues
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Card 1: View Team Introductions */}
                <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-purple-700 dark:text-purple-300">
                      <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-xl group-hover:scale-110 transition-transform">
                        <Eye className="w-6 h-6" />
                      </div>
                      <span>Browse Introductions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Discover your teammates' stories, backgrounds, and fun facts. Get inspired before creating your own!
                    </p>
                    
                    {recentIntroductions.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">Recent Introductions:</p>
                        {recentIntroductions.map((intro) => (
                          <div key={intro.id} className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={intro.author.profileImage || undefined} />
                              <AvatarFallback className="text-xs bg-purple-200 dark:bg-purple-800">
                                {intro.author.firstName[0]}{intro.author.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">
                                {intro.author.firstName} {intro.author.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">{intro.title}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="pt-2 flex items-center justify-between">
                      <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                        {introductionsCount} {introductionsCount === 1 ? 'introduction' : 'introductions'}
                      </Badge>
                    </div>
                    
                    <Button 
                      onClick={handleViewIntroductions}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg group-hover:shadow-xl transition-all"
                    >
                      View All Introductions
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>

                {/* Card 2: Create Your Introduction */}
                <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-pink-400 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-pink-700 dark:text-pink-300">
                      <div className="p-3 bg-pink-100 dark:bg-pink-900/50 rounded-xl group-hover:scale-110 transition-transform">
                        <MessageCircle className="w-6 h-6" />
                      </div>
                      <span>Your Introduction</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Share your background, role, interests, and fun facts with the team. Make your arrival known!
                    </p>
                    
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg space-y-3">
                      <div className="flex items-start gap-2 text-xs">
                        <div className="w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold shrink-0">1</div>
                        <p className="text-muted-foreground">Click "Introduce Yourself" below</p>
                      </div>
                      <div className="flex items-start gap-2 text-xs">
                        <div className="w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold shrink-0">2</div>
                        <p className="text-muted-foreground">Fill in your details and story</p>
                      </div>
                      <div className="flex items-start gap-2 text-xs">
                        <div className="w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold shrink-0">3</div>
                        <p className="text-muted-foreground">Share fun facts about yourself</p>
                      </div>
                      <div className="flex items-start gap-2 text-xs">
                        <div className="w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold shrink-0">4</div>
                        <p className="text-muted-foreground">Post and connect with the team!</p>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleCreateIntroduction}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg group-hover:shadow-xl transition-all"
                      data-testid="button-create-introduction"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Introduce Yourself
                    </Button>
                  </CardContent>
                </Card>

                {/* Card 3: Share Company News */}
                <Card className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-400 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-blue-700 dark:text-blue-300">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl group-hover:scale-110 transition-transform">
                        <Newspaper className="w-6 h-6" />
                      </div>
                      <span>Share Updates</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Have news to share or an important announcement? Post it to the Company Hub for everyone to see.
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-lg">
                        <Newspaper className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium">News Posts</p>
                          <p className="text-xs text-muted-foreground">Company updates & stories</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-lg">
                        <Megaphone className="w-5 h-5 text-teal-500" />
                        <div>
                          <p className="text-sm font-medium">Announcements</p>
                          <p className="text-xs text-muted-foreground">Important team notices</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleCreatePost('news')}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                        size="sm"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        News
                      </Button>
                      <Button 
                        onClick={() => handleCreatePost('announcement')}
                        className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white"
                        size="sm"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Announce
                      </Button>
                    </div>
                    
                    <Button 
                      onClick={handleViewIntroductions}
                      variant="outline"
                      className="w-full border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                    >
                      Go to Company Hub
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Info Banner */}
              <Card className="bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 dark:from-purple-950/50 dark:via-pink-950/50 dark:to-blue-950/50 border-2 border-purple-300 dark:border-purple-700">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl">
                      <MessageCircle className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Why introduce yourself?</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Your introduction helps teammates get to know you beyond your job title. Share your journey, 
                        your passions, and what makes you unique. It's a great way to break the ice and start building connections!
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-purple-500 hover:bg-purple-600">Build connections</Badge>
                        <Badge className="bg-pink-500 hover:bg-pink-600">Share your story</Badge>
                        <Badge className="bg-blue-500 hover:bg-blue-600">Team bonding</Badge>
                        <Badge className="bg-teal-500 hover:bg-teal-600">Be authentic</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Announcement Modal */}
      <CreateAnnouncementModal
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        type={createType}
      />
    </div>
  );
}