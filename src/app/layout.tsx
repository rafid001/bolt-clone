import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Provider from "@/components/custom/provider";
import AuthProvider from "@/components/custom/auth-provider";
import Header from "@/components/global/header";
import { Toaster } from "@/components/ui/sonner";
import { MessageProvider } from "@/contexts/MessageContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bolt - AI Code Generator",
  description: "Generate code with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <Provider>
            <Header />
            <MessageProvider>{children}</MessageProvider>
            <Toaster position="top-center" />
          </Provider>
        </AuthProvider>
      </body>
    </html>
  );
}
