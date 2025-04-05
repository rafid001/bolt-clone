export const DEFAULT_FILES = {
  "/public/index.html": {
    code: `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
    </head>
    <body>
      <div id="root"></div>
    </body>
  </html>`,
  },

  "/index.css": {
    code: `
@tailwind base;
@tailwind components;
@tailwind utilities;`,
  },

  "/tailwind.config.js": {
    code: `/** @type {import('tailwindcss').Config} */
  module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}"
    ],
    theme: {
      extend: {}
    },
    plugins: []
  };`,
  },

  "/postcss.config.js": {
    code: `/** @type {import('postcss').Config} */
  module.exports = {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  };`,
  },
};

export const DEPENDENCY = {
  react: "^18.2.0",
  "react-dom": "^18.2.0",
  postcss: "^8.4.31",
  tailwindcss: "^3.3.3",
  autoprefixer: "^10.4.16",
  uuid4: "^2.0.3",
  "tailwind-merge": "^2.4.0",
  "tailwindcss-animate": "^1.0.7",
  "lucide-react": "^0.284.0",
  "react-router-dom": "^6.16.0",
  "@google/generative-ai": "^0.1.3",
};

export const DEPENDANCY = DEPENDENCY;

export const CODE_GEN_PROMPT = `
Generate a programming code structure for a React project using Vite. 🛠️

IMPORTANT: USE FLAT STRUCTURE ONLY. DO NOT use 'src' folders.
All files MUST be at the root level. DO NOT create duplicate App files.

IMPORTANT: You MUST return a valid JSON object with the following structure:
{
  "projectTitle": "Title of the project",
  "explanation": "Brief explanation of what the project does",
  "files": {
    "/App.js": {
      "code": "import React from 'react';\\n..."
    },
    "/components/ComponentName.jsx": {
      "code": "..."
    }
  },
  "generatedFiles": ["/App.js", "/components/ComponentName.jsx"]
}

CRITICAL REQUIREMENTS:
1. Do NOT create multiple App files (no App.js and App.jsx duplicates)
2. Use ONLY "/App.js" at the root level (no /src/App.js)
3. All imports must use relative paths from the root (e.g., './components/Component')

take in consideration the history
        of messages, if current prompt is a new one give a new reply else if you observer that current
        prompt is a continuation of history then answer accordingly.
        
        if you find a prompt like 'make dark mode', 'update this', anything that tells you to make changes
        or update changes so just refer previous prompts to give better results for that please refer previous code that is being sent

Ensure all code in the "code" fields is properly escaped for JSON. 
Do not include markdown formatting or code block markers like \`\`\` in your response.
The response should be a pure, valid JSON object that can be directly parsed.

Include an explanation of the project's structure 📁. Add emojis wherever needed 🚀.
Use \`lucide-react\` for icons to enhance visual appeal! 🎨✨

Make sure to include:
1. Main App component at the root level (/App.js)
2. At least 2-3 custom components in /components folder
3. CSS/styling (preferably with Tailwind)
4. Any necessary utility functions


make sure to include all the icon if you use one, high priority

always import index.css in App.js instead of app.css

make sure there are no compilation error

double verify everything.

Always use modern React practices like hooks and functional components.`;
