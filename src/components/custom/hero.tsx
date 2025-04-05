"use client";

import React, { useState } from "react";
import { HeroHighlight } from "../global/background";
import { Textarea } from "../ui/textarea";
import { ArrowRight, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Props = {};

const Hero = (props: Props) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!session?.user) {
      toast.error("Please sign in to continue", {
        description: "You need to be logged in to create a workspace",
      });
      return;
    }

    if (!prompt.trim()) {
      toast.error("Please enter a prompt", {
        description: "Your prompt cannot be empty",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Generate a workspace name based on the first few words of the prompt
      const workspaceName =
        prompt
          .split(" ")
          .slice(0, 4)
          .join(" ")
          .replace(/[^\w\s]/gi, "") // Remove special characters
          .trim() + " Workspace";

      // Step 1: Create a new workspace
      const workspaceResponse = await fetch("/api/workspaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: workspaceName,
          description:
            "Created from prompt: " +
            prompt.substring(0, 100) +
            (prompt.length > 100 ? "..." : ""),
        }),
      });

      if (!workspaceResponse.ok) {
        throw new Error("Failed to create workspace");
      }

      const workspace = await workspaceResponse.json();

      // Step 2: Add the initial message to the workspace
      const messageResponse = await fetch(
        `/api/workspaces/${workspace.id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: {
              role: "user",
              text: prompt,
            },
          }),
        }
      );

      if (!messageResponse.ok) {
        throw new Error("Failed to save prompt");
      }

      toast.success("Workspace created!", {
        description: "Redirecting to your new workspace...",
      });

      // Step 3: Navigate to the workspace
      router.push(`/workspaces/${workspace.id}`);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong", {
        description: "Failed to create workspace. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen max-w-full overflow-x-hidden">
      <HeroHighlight containerClassName="w-full max-w-full">
        <div className="text-center w-full px-4 sm:px-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight">
            Build what you want,
          </h1>
          <div className="text-[#2675FF] mt-2">
            <h1 className="text-3xl sm:text-6xl font-extrabold tracking-tight">
              the AI way.
            </h1>
          </div>
        </div>

        <div className="mt-10 w-full flex justify-center px-4 sm:px-6">
          <div className="relative w-full max-w-[90%] sm:max-w-[85%] md:max-w-[75%] lg:max-w-[800px]">
            <Textarea
              placeholder="Enter your prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-4 h-28 sm:h-32 md:h-40 bg-white dark:bg-black focus:ring-0 focus:border-none focus:outline-none border-gray-300 dark:border-gray-700 rounded-xl pr-12 overflow-y-auto outline-none text-sm sm:text-base"
              style={{
                wordWrap: "break-word",
                overflowWrap: "break-word",
                whiteSpace: "pre-wrap",
              }}
              disabled={isLoading}
            />
            <button
              className="absolute top-4 right-4 p-1.5 sm:p-2 bg-[#2675FF] rounded-full text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Submit prompt"
              onClick={handleSubmit}
              disabled={isLoading || !prompt.trim()}
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin sm:w-5 sm:h-5" />
              ) : (
                <ArrowRight size={16} className="sm:w-5 sm:h-5" />
              )}
            </button>
          </div>
        </div>
      </HeroHighlight>
    </div>
  );
};

export default Hero;
