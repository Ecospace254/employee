import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel, SelectSeparator } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, InsertUser } from "@shared/schema";
import { z } from "zod";
import { Redirect } from "wouter";
import { Info } from "lucide-react";
import { DepartmentGuideModal } from "@/components/auth/DepartmentGuideModal";
import { departments } from "@/data/departments";
import { extractDepartmentFromRole } from "@/utils/departmentHelpers";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = insertUserSchema.omit({
  role: true,
  jobTitle: true,
  bio: true,
  startDate: true,
  profileImage: true,
  managerId: true,
  isActive: true
}).extend({
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showDepartmentGuide, setShowDepartmentGuide] = useState(false);
  
  const { user, loginMutation, registerMutation } = useAuth();

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      email: "",
      department: "",
    },
  });

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  const handleLogin = (data: LoginData) => {
    if (loginMutation) {
      loginMutation.mutate(data);
    }
  };

  const handleRegister = (data: RegisterData) => {
    console.log('Registration data:', data);
    console.log('Form state email:', registerForm.getValues('email'));
    if (registerMutation) {
      const { confirmPassword, ...userData } = data;
      
      // Extract department from the selected role
      const selectedRole = data.department; // This is actually the role/job title
      const actualDepartment = extractDepartmentFromRole(selectedRole);
      
      // Add required fields that are missing from the simplified schema
      const completeUserData = {
        ...userData,
        role: "employee",
        jobTitle: selectedRole, // Store the full role name as job title
        department: actualDepartment, // Store the extracted department name
        bio: "",
        isActive: true
      };
      registerMutation.mutate(completeUserData as InsertUser);
    }
  };

  return (
    <div className="min-h-screen bg-background grid grid-cols-1 lg:grid-cols-2">
      {/* Form Section */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold" data-testid="text-auth-title">
              {isLogin ? "Welcome Back" : "Join Our Team"}
            </h1>
            <p className="text-muted-foreground">
              {isLogin 
                ? "Sign in to access your onboarding portal" 
                : "Create your account to start your journey"
              }
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{isLogin ? "Sign In" : "Create Account"}</CardTitle>
              <CardDescription>
                {isLogin 
                  ? "Enter your credentials to continue" 
                  : "Fill in your details to get started"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLogin ? (
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-username" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} data-testid="input-password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation?.isPending || false}
                      data-testid="button-login"
                    >
                      {loginMutation?.isPending ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </Form>
              ) : (
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value ?? ""} data-testid="input-firstname" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value ?? ""} data-testid="input-lastname" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email"
                        type="email"
                        placeholder="name@company.com"
                        data-testid="input-email"
                        {...registerForm.register("email")}
                      />
                      {registerForm.formState.errors.email && (
                        <p className="text-sm text-red-600">
                          {registerForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ""} data-testid="input-register-username" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Role is automatically set to employee for security */}

                    <FormField
                      control={registerForm.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department & Role</FormLabel>
                          <div className="flex gap-2">
                            <Select onValueChange={field.onChange} value={field.value ?? ""}>
                              <FormControl>
                                <SelectTrigger className="flex-1 text-left" data-testid="select-department">
                                  <SelectValue placeholder="Select your role..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="max-h-[300px]">
                                {departments.map((dept, deptIndex) => (
                                  <div key={dept.id}>
                                    {deptIndex > 0 && <SelectSeparator />}
                                    <SelectGroup>
                                      <SelectLabel>{dept.name}</SelectLabel>
                                      {dept.roles.map((role) => (
                                        <SelectItem key={role} value={role}>
                                          {role}
                                        </SelectItem>
                                      ))}
                                    </SelectGroup>
                                  </div>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => setShowDepartmentGuide(true)}
                              className="flex-shrink-0"
                              data-testid="button-view-departments"
                            >
                              <Info className="h-4 w-4" />
                            </Button>
                          </div>
                          <FormDescription className="text-xs">
                            Not sure? Click the info button to view all departments
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} value={field.value ?? ""} data-testid="input-register-password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} value={field.value ?? ""} data-testid="input-confirm-password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={registerMutation?.isPending || false}
                      data-testid="button-register"
                    >
                      {registerMutation?.isPending ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </Form>
              )}

              <div className="text-center">
                <Button 
                  variant="ghost" 
                  onClick={() => setIsLogin(!isLogin)}
                  data-testid="button-toggle-auth"
                >
                  {isLogin 
                    ? "Don't have an account? Sign up" 
                    : "Already have an account? Sign in"
                  }
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-primary text-primary-foreground flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-6">
          <div className="w-20 h-20 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl font-bold">🚀</span>
          </div>
          
          <h2 className="text-3xl font-bold" data-testid="text-hero-title">
            Start Your Journey
          </h2>
          
          <p className="text-primary-foreground/90 leading-relaxed" data-testid="text-hero-description">
            Join our comprehensive onboarding platform designed to help new team members 
            integrate smoothly and access all the resources they need for success.
          </p>
          
          <div className="space-y-2 text-sm text-primary-foreground/80">
            <p>✓ Role-based access to resources</p>
            <p>✓ Personalized onboarding checklist</p>
            <p>✓ Training materials and courses</p>
            <p>✓ Connect with your team</p>
          </div>
        </div>
      </div>

      {/* Department Guide Modal */}
      <DepartmentGuideModal 
        open={showDepartmentGuide} 
        onOpenChange={setShowDepartmentGuide} 
      />
    </div>
  );
}