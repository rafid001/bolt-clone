"use client";

import ChatView from "@/components/custom/chat-view";
import CodeView from "@/components/custom/code-view";
import Header from "@/components/global/header";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type Message = {
  id: string;
  content: any;
  fileData: string | null;
  createdAt: string;
};

type Workspace = {
  id: string;
  name: string;
  description: string | null;
  messages: Message[];
};

const WorkspacePage = () => {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (status === "authenticated" && params.id) {
      fetchWorkspaceDetails();
    }
  }, [status, params.id]);

  const fetchWorkspaceDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/workspaces/${params.id}`);

      if (response.status === 404) {
        setError("Workspace not found");
        toast.error("Workspace not found");
        router.push("/");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch workspace details");
      }

      const data: Workspace = await response.json();
      console.log("Workspace data:", data);
      setWorkspace(data);
    } catch (error) {
      console.error("Error fetching workspace:", error);
      setError("Failed to load workspace data");
      toast.error("Failed to load workspace data");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle new messages without reloading the entire workspace
  const handleNewMessage = (message: Message) => {
    if (!workspace) return;

    // Update workspace with the new message
    setWorkspace((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        messages: [...prev.messages, message],
      };
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading workspace...</span>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500">Error</h2>
          <p className="mt-2">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 px-4 md:px-10">
      {workspace && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{workspace.name}</h1>
          {workspace.description && (
            <p className="text-muted-foreground mt-1">
              {workspace.description}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="">
          <ChatView
            messages={workspace?.messages || []}
            workspaceId={params.id as string}
            refreshWorkspace={fetchWorkspaceDetails}
            onNewMessage={handleNewMessage}
          />
        </div>
        <div className="col-span-3">
          <CodeView messages={workspace?.messages || []} />
        </div>
      </div>
    </div>
  );
};

export default WorkspacePage;
