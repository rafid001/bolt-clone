"use client";

import Image from "next/image";
import React, { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { FcGoogle } from "react-icons/fc";
import { Separator } from "../ui/separator";
import { signIn, signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { LogOut, Menu, Settings, User, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { useRouter } from "next/navigation";

type Props = {};

const Header = (props: Props) => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  console.log("Session status:", status);
  console.log("Session data:", session);

  // Function to get initials from name
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const checkSession = async () => {
    try {
      const response = await fetch("/api/auth/debug");
      const data = await response.json();
      console.log("Debug session data:", data);
      toast.info(
        `Session check: ${
          data.authenticated ? "Authenticated" : "Not authenticated"
        }`
      );
    } catch (error) {
      console.error("Session check error:", error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="flex w-full items-center justify-between p-4 ">
        <Image
          src={"/images/light.png"}
          alt="logo"
          width={80}
          height={80}
          className="h-auto w-auto max-h-12 sm:max-h-16 cursor-pointer"
          onClick={() => router.push("/")}
        />

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-5">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <Avatar className="h-10 w-10 cursor-pointer transition-all hover:ring-2 hover:ring-primary ring-offset-2">
                  <AvatarImage src={session?.user?.image || ""} />
                  <AvatarFallback className="bg-[#2675FF] text-white">
                    {getInitials(session?.user?.name)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session?.user?.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session?.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:text-red-500"
                  onClick={() => {
                    signOut();
                    toast.success("Logged out successfully");
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Login</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <AuthenticationDialog defaultTab="login" />
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button>Signup</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <AuthenticationDialog defaultTab="signup" />
                </DialogContent>
              </Dialog>
            </>
          )}
          {/* {process.env.NODE_ENV === "development" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={checkSession}
              className="ml-2"
            >
              Check Session
            </Button>
          )} */}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80vw] sm:w-[350px] pt-10">
              <div className="flex flex-col h-full">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center space-x-3 mb-6">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={session?.user?.image || ""} />
                        <AvatarFallback className="bg-[#2675FF] text-white">
                          {getInitials(session?.user?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{session?.user?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {session?.user?.email}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          signOut();
                          setIsMenuOpen(false);
                          toast.success("Logged out successfully");
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Login
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-[calc(100%-2rem)] max-w-[425px] p-4 sm:p-6">
                        <DialogTitle>Authentication</DialogTitle>
                        <AuthenticationDialog defaultTab="login" />
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          className="w-full"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Signup
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-[calc(100%-2rem)] max-w-[425px] p-4 sm:p-6">
                        <DialogTitle>Authentication</DialogTitle>
                        <AuthenticationDialog defaultTab="signup" />
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

interface AuthDialogProps {
  defaultTab: "login" | "signup";
}

const AuthenticationDialog = ({ defaultTab }: AuthDialogProps) => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  const [isLoading, setIsLoading] = useState(false);

  const [activeTab, setActiveTab] = useState(defaultTab);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  // Signup form state
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    agreeToTerms: false,
  });

  // Form errors state
  const [formErrors, setFormErrors] = useState({
    email: "",
    password: "",
    name: "",
  });

  // Handle login form change
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setLoginData({
      ...loginData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle signup form change
  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSignupData({
      ...signupData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle login submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginData.email || !loginData.password) {
      toast.error("Missing information", {
        description: "Please enter both email and password.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: loginData.email,
        password: loginData.password,
      });

      if (result?.error) {
        toast.error("Login failed", {
          description: "Invalid email or password.",
        });
      } else {
        toast.success("Login successful", {
          description: "Welcome back!",
        });
      }
    } catch (error) {
      toast.error("Something went wrong", {
        description: "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle signup submission
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signupData.name || !signupData.email || !signupData.password) {
      toast.error("Missing information", {
        description: "Please fill in all required fields.",
      });
      return;
    }

    if (!signupData.agreeToTerms) {
      toast.error("Terms agreement required", {
        description: "Please agree to the Terms of Service and Privacy Policy.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: signupData.name,
          email: signupData.email,
          password: signupData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.message === "Email already in use") {
          setFormErrors({
            ...formErrors,
            email: "Email already in use",
          });
          toast.error("Email already registered", {
            description:
              "You can log in with your password or try using Google sign-in.",
          });
          setActiveTab("login");
          setLoginData({
            ...loginData,
            email: signupData.email,
          });
          return;
        } else {
          throw new Error(data.message || "Registration failed");
        }
        return;
      }

      toast.success("Account created", {
        description: "Your account has been created successfully!",
      });

      // Auto-login after successful registration
      await signIn("credentials", {
        redirect: false,
        email: signupData.email,
        password: signupData.password,
      });
    } catch (error: any) {
      toast.error("Registration failed", {
        description: error.message || "Something went wrong.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google sign-in
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const result = await signIn("google", {
        callbackUrl: window.location.origin,
        redirect: false,
      });

      console.log("Google sign-in result:", result);

      if (result?.error) {
        toast.error("Google sign-in failed", {
          description: "Please try again or use email/password.",
        });
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("Google sign-in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as "login" | "signup")}
      className="w-full"
    >
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold text-center">
          {activeTab === "login" ? "Welcome Back" : "Create an Account"}
        </DialogTitle>
        <TabsList className="grid w-full grid-cols-2 my-4">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <DialogDescription className="text-center text-sm mb-2">
          Access your account with a few simple steps
        </DialogDescription>
      </DialogHeader>

      <TabsContent value="login" className="space-y-4">
        <Button
          variant="outline"
          className="w-full py-5 sm:py-6 flex items-center gap-2 text-sm sm:text-base"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <FcGoogle className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>Continue with Google</span>
        </Button>

        <div className="flex items-center my-3 sm:my-4">
          <Separator className="flex-1" />
          <span className="mx-2 text-xs text-muted-foreground">OR</span>
          <Separator className="flex-1" />
        </div>

        <form onSubmit={handleLogin} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              placeholder="your@email.com"
              type="email"
              value={loginData.email}
              onChange={handleLoginChange}
              required
              className="h-10 sm:h-9"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={loginData.password}
              onChange={handleLoginChange}
              required
            />
          </div>

          <div className="flex items-center space-x-2 py-1 text-xs">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              className="rounded-sm h-4 w-4"
              checked={loginData.rememberMe}
              onChange={handleLoginChange}
            />
            <label htmlFor="rememberMe" className="select-none">
              Remember me
            </label>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#2675FF] hover:bg-blue-600 h-10 sm:h-9"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="signup" className="space-y-4">
        <Button
          variant="outline"
          className="w-full py-5 sm:py-6 flex items-center gap-2 text-sm sm:text-base"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <FcGoogle className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>Sign up with Google</span>
        </Button>

        <div className="flex items-center my-3 sm:my-4">
          <Separator className="flex-1" />
          <span className="mx-2 text-xs text-muted-foreground">OR</span>
          <Separator className="flex-1" />
        </div>

        <form onSubmit={handleSignup} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="John Doe"
              value={signupData.name}
              onChange={handleSignupChange}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="signup-email">Email</Label>
            <Input
              id="signup-email"
              name="email"
              placeholder="your@email.com"
              type="email"
              value={signupData.email}
              onChange={handleSignupChange}
              required
              className={formErrors.email ? "border-red-500" : ""}
            />
            {formErrors.email && (
              <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="signup-password">Password</Label>
            <Input
              id="signup-password"
              name="password"
              type="password"
              value={signupData.password}
              onChange={handleSignupChange}
              required
            />
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <input
              type="checkbox"
              id="agreeToTerms"
              name="agreeToTerms"
              className="rounded-sm"
              checked={signupData.agreeToTerms}
              onChange={handleSignupChange}
            />
            <label htmlFor="agreeToTerms">
              I agree to the{" "}
              <a href="#" className="text-[#2675FF] hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-[#2675FF] hover:underline">
                Privacy Policy
              </a>
            </label>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#2675FF] hover:bg-blue-600 h-10 sm:h-9"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  );
};

export default Header;
