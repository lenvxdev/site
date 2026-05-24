import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Cursor } from "./components/Cursor";
import { GlobalSounds } from "./components/GlobalSounds";
import { LowEndNotice } from "./components/LowEndNotice";
import { PS2Background } from "./components/PS2Background";
import { PS2Startup } from "./components/PS2Startup";
import { PerfProvider } from "./contexts/PerformanceContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = "https://lenvx.dev";

const DESCRIPTION = "lenvx's personal site";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Lenvx",
    template: "%s | Lenvx",
  },
  description: DESCRIPTION,
  keywords: [
    "Lenvx", "lenvx.dev", "lenvxdev",
    "developer", "self-taught developer", "programmer", "coder",
    "web development", "web developer", "frontend", "Next.js", "React", "TypeScript",
    "Minecraft", "Minecraft plugin", "Minecraft developer", "Kotlin", "Java",
    "music producer", "phonk", "breakcore", "house music", "music",
    "graphic design", "logo design", "UI design", "thumbnail design",
    "photography", "portfolio", "personal site",
  ],
  authors: [{ name: "Lenvx", url: BASE_URL }],
  creator: "Lenvx",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Lenvx",
    title: "Lenvx",
    description: DESCRIPTION,
    images: [
      {
        url: "/banner.png",
        width: 1200,
        height: 630,
        alt: "Lenvx",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lenvx",
    description: DESCRIPTION,
    images: [{ url: "/banner.png", alt: "Lenvx" }],
  },
  icons: {
    icon: "/pfp.png",
    apple: "/pfp.png",
    shortcut: "/pfp.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body>
        <PerfProvider>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Person",
                name: "Lenvx",
                url: BASE_URL,
                description: "lenvx's personal site",
                sameAs: ["https://github.com/lenvxdev"],
                knowsAbout: ["Web Development", "Minecraft", "Kotlin", "Music Production", "Graphic Design"],
              }),
            }}
          />
          <PS2Startup />
          <PS2Background />
          <Cursor />
          <GlobalSounds />
          <LowEndNotice />
          {children}
        </PerfProvider>
      </body>
    </html>
  );
}
