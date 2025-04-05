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

type Props = {};

const Header = (props: Props) => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="flex w-full items-center justify-between p-4 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
        <Image src={"/images/light.png"} alt="logo" width={80} height={80} />
        <div className="flex items-center gap-5">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2">
                {session.user?.image && (
                  <Image
                    src={session.user.image}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <span>{session.user?.name}</span>
              </div>
              <Button variant="outline" onClick={() => signOut()}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Login</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogTitle className="sr-only">Authentication</DialogTitle>
                  <AuthenticationDialog defaultTab="login" />
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button>Signup</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogTitle className="sr-only">Authentication</DialogTitle>
                  <AuthenticationDialog defaultTab="signup" />
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

interface AuthDialogProps {
  defaultTab: "login" | "signup";
}

const AuthenticationDialog = ({ defaultTab }: AuthDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);

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
        throw new Error(data.message || "Registration failed");
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
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: window.location.origin });
    } catch (error) {
      toast.error("Google sign-in failed", {
        description: "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold text-center">
          {defaultTab === "login" ? "Welcome Back" : "Create an Account"}
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
          className="w-full py-6 flex items-center gap-2"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <FcGoogle className="h-5 w-5" />
          <span>Continue with Google</span>
        </Button>

        <div className="flex items-center my-4">
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

          <div className="flex justify-between text-xs">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                className="rounded-sm"
                checked={loginData.rememberMe}
                onChange={handleLoginChange}
              />
              <label htmlFor="rememberMe">Remember me</label>
            </div>
            <a href="#" className="text-[#2675FF] hover:underline">
              Forgot password?
            </a>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#2675FF] hover:bg-blue-600"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="signup" className="space-y-4">
        <Button
          variant="outline"
          className="w-full py-6 flex items-center gap-2"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <FcGoogle className="h-5 w-5" />
          <span>Sign up with Google</span>
        </Button>

        <div className="flex items-center my-4">
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
            />
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
            className="w-full bg-[#2675FF] hover:bg-blue-600"
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
