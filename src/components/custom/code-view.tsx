"use client";

import { DEFAULT_FILES } from "@/data/lookup";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
} from "@codesandbox/sandpack-react";
import { useEffect, useState } from "react";
import { useMessageContext } from "@/contexts/MessageContext";

type Props = {
  messages: any;
};

interface CodeFile {
  code: string;
}

type SandpackFiles = Record<string, { code: string }>;

interface CodeResponse {
  projectTitle?: string;
  explanation?: string;
  files: SandpackFiles;
  generatedFiles?: string[];
  rawText?: string;
  error?: string;
}

// Fixed dependencies object with proper versions
const DEPENDENCIES = {
  react: "^18.2.0",
  "react-dom": "^18.2.0",
  "lucide-react": "^0.284.0",
  "react-router-dom": "^6.16.0",
  tailwindcss: "^3.3.3",
  postcss: "^8.4.31",
  autoprefixer: "^10.4.16",
};

// Normalize file paths to prevent duplications
const normalizeFiles = (
  files: SandpackFiles,
  existingFiles: SandpackFiles
): SandpackFiles => {
  const result: SandpackFiles = {};
  const filesByName = new Map<string, string[]>();

  // First, check if we already have App files in the existing files
  const existingAppFiles = Object.keys(existingFiles).filter(
    (path) =>
      path.endsWith("App.jsx") ||
      path.endsWith("App.js") ||
      path.endsWith("App.tsx")
  );

  // First, handle all non-App files from the new files
  Object.keys(files).forEach((path) => {
    const baseName =
      path
        .split("/")
        .pop()
        ?.replace(/\.[^/.]+$/, "") || "";
    if (baseName !== "App") {
      // For non-App files, just add them directly
      result[path] = files[path];
    }
  });

  // Then, handle App files
  const newAppFiles = Object.keys(files).filter(
    (path) =>
      path.endsWith("App.jsx") ||
      path.endsWith("App.js") ||
      path.endsWith("App.tsx")
  );

  if (existingAppFiles.length > 0 && newAppFiles.length > 0) {
    // We have both existing and new App files
    // Update the content of the existing App files with the content from the new App files
    const existingAppFile = existingAppFiles[0]; // Take the first existing App file
    const newAppFile = newAppFiles[0]; // Take the first new App file

    // Update the existing App file with the content from the new App file
    result[existingAppFile] = files[newAppFile];

    console.log(
      `Updated existing App file ${existingAppFile} with content from ${newAppFile}`
    );
  } else if (newAppFiles.length > 0) {
    // We only have new App files, make sure we only keep one
    const preferredAppFile =
      newAppFiles.find((f) => f.endsWith(".jsx")) ||
      newAppFiles.find((f) => f.endsWith(".tsx")) ||
      newAppFiles[0];

    result[preferredAppFile] = files[preferredAppFile];
  } else if (existingAppFiles.length > 0) {
    // We only have existing App files, keep them as they are
    existingAppFiles.forEach((file) => {
      result[file] = existingFiles[file];
    });
  }

  return result;
};

// Make sure we have a valid entry point
const ensureEntryPoint = (files: SandpackFiles): SandpackFiles => {
  const result = { ...files };

  // Check for any App files (regardless of extension or location)
  const appFiles = Object.keys(files).filter(
    (file) =>
      file.endsWith("/App.jsx") ||
      file.endsWith("/App.js") ||
      file.endsWith("/App.tsx") ||
      file === "App.jsx" ||
      file === "App.js" ||
      file === "App.tsx"
  );

  // Check for any index files
  const indexFiles = Object.keys(files).filter(
    (file) =>
      file.endsWith("/index.js") ||
      file.endsWith("/index.jsx") ||
      file.endsWith("/index.tsx") ||
      file === "index.js" ||
      file === "index.jsx" ||
      file === "index.tsx"
  );

  // If we have at least one App file but no index file, add an index file
  if (appFiles.length > 0 && indexFiles.length === 0) {
    // Find preferred App file path
    const appFile =
      appFiles.find((f) => f.endsWith(".jsx")) ||
      appFiles.find((f) => f.endsWith(".tsx")) ||
      appFiles[0];

    // Get the correct import path (accounting for path with or without leading slash)
    const importPath = appFile.startsWith("/")
      ? `.${appFile.substring(0, appFile.lastIndexOf("."))}`
      : `./${appFile.substring(0, appFile.lastIndexOf("."))}`;

    // Add index.js pointing to the App file
    result["/index.js"] = {
      code: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '${importPath}';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
    };
  }

  // If we have no App files and no index files, create both
  if (appFiles.length === 0 && indexFiles.length === 0) {
    // Add App.jsx
    result["/App.jsx"] = {
      code: `import React from 'react';

export default function App() {
  return (
    <div className="App">
      <h1>Hello, React!</h1>
    </div>
  );
}`,
    };

    // Add index.js
    result["/index.js"] = {
      code: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
    };
  }

  return result;
};

const CodeView = ({ messages }: Props) => {
  const [activeTab, setActiveTab] = useState("code");
  const [files, setFiles] = useState<SandpackFiles>(DEFAULT_FILES);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectInfo, setProjectInfo] = useState<{
    title: string;
    explanation: string;
  } | null>(null);
  const [activeFile, setActiveFile] = useState<string | undefined>(undefined);

  // Find the most appropriate entry file to show first
  const determineMainFile = (files: SandpackFiles): string => {
    const fileKeys = Object.keys(files);

    // Priority: App.jsx > App.tsx > App.js > index.jsx > index.js
    if (fileKeys.includes("/App.jsx")) return "/App.jsx";
    if (fileKeys.includes("/App.tsx")) return "/App.tsx";
    if (fileKeys.includes("/App.js")) return "/App.js";
    if (fileKeys.includes("/index.jsx")) return "/index.jsx";
    if (fileKeys.includes("/index.js")) return "/index.js";

    // Default to the first file if none of the above are found
    return fileKeys[0];
  };

  useEffect(() => {
    console.log("first time", messages);
    if (
      messages &&
      messages.length > 0 &&
      (messages[messages.length - 1]?.content?.role === "user" ||
        messages[messages.length - 1]?.role === "user")
    ) {
      GenAiCode();
    }
  }, [messages]);

  const GenAiCode = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let main_prompt = "";
      const lastMessage = messages[messages.length - 1];

      const previous_messages = messages?.map((msg: any) => {
        return {
          message: msg?.context?.text ?? msg.content,
        };
      });

      // Extract the prompt text based on message structure
      if (lastMessage?.content?.text) {
        main_prompt = lastMessage.content.text;
      } else if (typeof lastMessage?.content === "string") {
        main_prompt = lastMessage.content;
      } else {
        console.error("Could not find message content");
        setError("Could not find message content");
        setIsLoading(false);
        return;
      }

      let full_prompt = `${main_prompt}`;

      const resp = await fetch("/api/ai/generate", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          prompt: main_prompt,
          history: previous_messages,
          previous_code: files,
        }),
      });

      if (!resp.ok) {
        throw new Error(`API response error: ${resp.status}`);
      }

      const data: CodeResponse = await resp.json();
      console.log("Response data:", data);

      if (data.error) {
        setError(data.error);
        return;
      }

      // Check if the response has the files property
      if (data.files && Object.keys(data.files).length > 0) {
        console.log("Files:", data.files);

        // Process the files, preserving existing structure when possible
        const processedFiles: SandpackFiles = {};

        // Process all files from the response
        Object.entries(data.files).forEach(([filePath, fileContent]) => {
          // Make sure path starts with a slash
          const path = filePath.startsWith("/") ? filePath : `/${filePath}`;

          // Make sure the file content has the expected format
          if (typeof fileContent === "string") {
            processedFiles[path] = { code: fileContent };
          } else if (fileContent && typeof fileContent.code === "string") {
            processedFiles[path] = { code: fileContent.code };
          } else {
            console.warn(`Invalid file content for ${path}`, fileContent);
            processedFiles[path] = { code: "// Invalid file content" };
          }
        });

        // Add missing entry points if needed
        let updatedFiles = ensureEntryPoint(processedFiles);

        // Update existing files (especially App files) instead of creating new ones
        updatedFiles = normalizeFiles(updatedFiles, files);

        // Set the active file to the most appropriate main file
        const mainFile = determineMainFile(updatedFiles);
        setActiveFile(mainFile);

        // Update state
        setFiles(updatedFiles);

        // Store project info if available
        if (data.projectTitle || data.explanation) {
          setProjectInfo({
            title: data.projectTitle || "React Project",
            explanation: data.explanation || "Generated code",
          });
        }
      } else {
        setError("No files were generated from the AI response");
      }
    } catch (error) {
      console.error("Error generating code:", error);
      setError(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#181818] w-full p-2 border rounded-md overflow-hidden">
      <div className="flex items-center justify-between bg-[#1e1e1e] p-2 rounded-t-md border-b border-gray-700 mb-2">
        <div className="flex items-center gap-2">
          {["code", "preview"].map((tab) => (
            <button
              key={tab}
              className={`text-sm font-medium px-3 py-1 rounded-full transition-all duration-200 ${
                activeTab === tab
                  ? "bg-blue-500 text-white shadow"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-gray-400 text-sm animate-pulse">
            Generating code...
          </div>
        ) : error ? (
          <div className="text-red-400 text-sm">{error}</div>
        ) : (
          projectInfo && (
            <div className="text-gray-400 text-sm">{projectInfo.title}</div>
          )
        )}
      </div>

      <SandpackProvider
        template="react"
        theme="dark"
        files={files}
        customSetup={{
          dependencies: DEPENDENCIES,
          entry: Object.keys(files).includes("/index.js")
            ? "/index.js"
            : Object.keys(files).includes("/src/index.js")
            ? "/src/index.js"
            : undefined,
        }}
        options={{
          externalResources: ["https://cdn.tailwindcss.com"],
          recompileMode: "delayed",
          recompileDelay: 500,
          activeFile: activeFile,
        }}
      >
        <SandpackLayout>
          {activeTab === "code" ? (
            <>
              <SandpackFileExplorer style={{ height: "70vh" }} />
              <SandpackCodeEditor
                style={{ height: "70vh" }}
                showLineNumbers={true}
                showInlineErrors={true}
              />
            </>
          ) : (
            <SandpackPreview
              style={{ height: "70vh" }}
              showNavigator={true}
              showRefreshButton={true}
            />
          )}
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
};

export default CodeView;
