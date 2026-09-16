import dynamic from "next/dynamic";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/Hero";
import { Stats } from "@/components/sections/Stats";
import { Services } from "@/components/sections/Services";
import { TrafficSources } from "@/components/sections/TrafficSources";

// Below-the-fold sections are code-split so the hero paints fast.
const AdTech = dynamic(() => import("@/components/sections/AdTech").then((m) => m.AdTech));
const MediaBuying = dynamic(() => import("@/components/sections/MediaBuying").then((m) => m.MediaBuying));
const Technology = dynamic(() => import("@/components/sections/Technology").then((m) => m.Technology));
const Industries = dynamic(() => import("@/components/sections/Industries").then((m) => m.Industries));
const WhyPixelADX = dynamic(() => import("@/components/sections/WhyPixelADX").then((m) => m.WhyPixelADX));
const CaseStudies = dynamic(() => import("@/components/sections/CaseStudies").then((m) => m.CaseStudies));
const Process = dynamic(() => import("@/components/sections/Process").then((m) => m.Process));
const Testimonials = dynamic(() => import("@/components/sections/Testimonials").then((m) => m.Testimonials));
const GlobalReach = dynamic(() => import("@/components/sections/GlobalReach").then((m) => m.GlobalReach));
const CTA = dynamic(() => import("@/components/sections/CTA").then((m) => m.CTA));

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="relative">
        <Hero />
        <Stats />
        <TrafficSources />
        <Services />
        <AdTech />
        <MediaBuying />
        <Technology />
        <Industries />
        <WhyPixelADX />
        <CaseStudies />
        <Process />
        <Testimonials />
        <GlobalReach />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
