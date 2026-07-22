import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import RegisterPWA from "./register-pwa";
import Navbar from "./components/navbar";
import { UploadProvider } from "./components/upload-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My PWA",
  description: "A simple installable PWA landing page",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <RegisterPWA />
        <UploadProvider>
          <Navbar />
          {children}
        </UploadProvider>
      </body>
    </html>
  );
}
