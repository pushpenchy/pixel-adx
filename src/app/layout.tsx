import type { Metadata, Viewport } from "next";
import { Inter, Manrope, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Background } from "@/components/Background";
import { CursorGlow } from "@/components/CursorGlow";
import { LiquidLens } from "@/components/LiquidLens";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Intro } from "@/components/Intro";
import { ThemeProvider, themeInitScript } from "@/components/theme/ThemeProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap", weight: ["500", "600", "700", "800"] });
const serif = Instrument_Serif({ subsets: ["latin"], variable: "--font-instrument", display: "swap", weight: "400", style: ["normal", "italic"] });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap", weight: ["400", "500"] });

export const metadata: Metadata = {
  title: {
    default: "Pixel ADX — AdTech, Media Buying & Digital Technology",
    template: "%s · Pixel ADX",
  },
  description:
    "Pixel ADX combines advertising technology, media buying, software engineering and data-driven digital solutions to help businesses acquire customers, scale campaigns and build better digital products.",
  keywords: ["AdTech", "Media Buying", "Performance Marketing", "Software Development", "Bangladesh", "Digital Growth"],
  openGraph: {
    title: "Pixel ADX — We Build Technology. We Buy Attention. We Drive Growth.",
    description: "AdTech, media buying and digital technology solutions built for growth.",
    type: "website",
    siteName: "Pixel ADX",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#050507" },
    { media: "(prefers-color-scheme: light)", color: "#f6f7fb" },
  ],
  colorScheme: "dark light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable} ${serif.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {/* Applies the stored theme before first paint to avoid a flash */}
        <Script id="px-theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
      </head>
      <body className="grain min-h-dvh antialiased">
        <ThemeProvider>
          <Intro />
          <SmoothScroll />
          <Background />
          <CursorGlow />
          <LiquidLens />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
