"use client";

import React, { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import chatPrompt from "@/context/prompts/chat-prompt";

type Message = {
  role: "user" | "ai";
  id: string;
  content: any;
  fileData?: string | null;
  createdAt: string;
  workspaceId: string;
  _processed?: boolean;
};

type ChatViewProps = {
  messages: Message[];
  workspaceId: string;
  refreshWorkspace: () => Promise<void>;
  onNewMessage: (message: Message) => void;
};

const ChatView = ({
  messages,
  workspaceId,
  refreshWorkspace,
  onNewMessage,
}: ChatViewProps) => {
  const [newMessage, setNewMessage] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [counter, setCounter] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (counter > 0) {
      if (messages.length > 0) {
        updateMessages();
      }
    }
    setCounter(counter + 1);

    const lastMessage = messages[messages.length - 1];
    const isUserMessage =
      lastMessage?.content?.role === "user" || lastMessage?.role === "user";

    if (messages.length > 0 && isUserMessage && !lastMessage._processed) {
      if (typeof lastMessage === "object") {
        lastMessage._processed = true;
      }
      getAiResponse();
    }
  }, [messages]);

  const getAiResponse = async () => {
    setIsSending(true);
    try {
      // Collect all messages with correct structure
      const formattedMessages = messages.map((msg) => ({
        role: msg.role || msg.content.role, // Ensure role is correctly assigned
        message: msg.content.text, // Extracting the message text properly
      }));

      console.log("Formatted Messages: ", formattedMessages); // Debugging

      const resp = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: JSON.stringify(formattedMessages) + chatPrompt.CHAT_PROMPT,
        }),
      });

      const response = await resp.json();
      console.log("AI Response: ", response);

      const aiResponseText =
        response.response?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (aiResponseText) {
        onNewMessage({
          role: "ai",
          id: Date.now().toString(),
          content: { text: aiResponseText },
          fileData: null,
          createdAt: new Date().toISOString(),
          workspaceId: workspaceId,
        });
      } else {
        throw new Error("Invalid AI response format.");
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      toast.error("Failed to fetch AI response.");
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      role: "user",
      id: Date.now().toString(),
      content: { text: newMessage.trim() },
      fileData: null,
      createdAt: new Date().toISOString(),
      workspaceId: workspaceId,
    };

    onNewMessage(userMessage);
    setNewMessage("");
  };

  const updateMessages = async () => {
    const response = await fetch("/api/update/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });

    console.log("updateresp", response);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] max-w-[1200px] w-full rounded-md overflow-hidden">
      <div className="p-3 ">
        <h2 className="font-medium">Chat</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 w-full">
        {messages.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            {initializing ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <p>Initializing conversation...</p>
              </div>
            ) : (
              "No messages yet. Start the conversation!"
            )}
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id}>
              <div
                className={`max-w-[90%] p-3 rounded-lg ${
                  message.role === "user" || message.content.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium">
                    {message.role === "user" || message.content.role === "user"
                      ? "You"
                      : "AI Assistant"}
                  </span>
                  <span className="text-xs opacity-70">
                    {formatDate(message.createdAt)}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm">
                  {message.content.text}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t">
        <div className="relative">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ask me to build something for you..."
            className="min-h-[80px] pr-12 resize-none"
            disabled={isSending}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !isSending) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            size="icon"
            className="absolute right-2 bottom-2"
            onClick={handleSendMessage}
            disabled={isSending}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Shift + Enter for a new line. Enter to send.
        </p>
      </div>
    </div>
  );
};

export default ChatView;
