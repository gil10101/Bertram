import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, Instrument_Serif, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif",
});

// Landing page (landing-v3) type system — Inter Tight + JetBrains Mono.
const interTight = Inter_Tight({
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-inter-tight",
});
const jetBrainsMono = JetBrains_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Bertram — AI Email Manager",
  description: "AI-powered email management with Gmail and Outlook integration",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en">
        <body
          className={`${inter.variable} ${instrumentSerif.variable} ${interTight.variable} ${jetBrainsMono.variable} font-sans`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
