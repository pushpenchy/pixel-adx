"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { ArrowLeft, Radar, Megaphone, Target, Braces, Globe, Smartphone, PenTool, ShoppingBag, BarChart3, Workflow, type LucideIcon } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Section, SectionHeading } from "@/components/ui/Section";
import { TextTicker } from "@/components/ui/TextTicker";
import { services, type ServiceIcon } from "@/content/site";
import { ImageAccordion, ScrollWords, StackCards, serviceItems } from "./Blocks";
import { BentoHero, MaskRevealHero, MeshHero, TrailHero } from "./Heroes";
import { demoPanels, PanelImage } from "./PanelImage";

const Stats = dynamic(() => import("@/components/sections/Stats").then((m) => m.Stats));
const TrafficSources = dynamic(() => import("@/components/sections/TrafficSources").then((m) => m.TrafficSources));
const ServicesStage = dynamic(() => import("@/components/sections/ServicesStage").then((m) => m.ServicesStage));
const ServicesStory = dynamic(() => import("@/components/sections/ServicesStory").then((m) => m.ServicesStory));
const Industries = dynamic(() => import("@/components/sections/Industries").then((m) => m.Industries));
const WhyPixelADX = dynamic(() => import("@/components/sections/WhyPixelADX").then((m) => m.WhyPixelADX));
const CaseStudies = dynamic(() => import("@/components/sections/CaseStudies").then((m) => m.CaseStudies));
const Process = dynamic(() => import("@/components/sections/Process").then((m) => m.Process));
const Testimonials = dynamic(() => import("@/components/sections/Testimonials").then((m) => m.Testimonials));
const GlobalReach = dynamic(() => import("@/components/sections/GlobalReach").then((m) => m.GlobalReach));
const CTA = dynamic(() => import("@/components/sections/CTA").then((m) => m.CTA));

export type TemplateId = "trail" | "story" | "bento" | "reveal";

export const templates: { id: TemplateId; name: string; tagline: string; says: string; blocks: string[] }[] = [
  {
    id: "trail",
    name: "Trail",
    tagline: "Giant type, a cursor that leaves dashboards and platform logos behind it, services as cards that stack as you scroll.",
    says: "Creative-agency energy. Playful on desktop, calm on phones.",
    blocks: ["Image mouse-trail hero", "Stacking cards", "Marquee", "Scroll-word manifesto"],
  },
  {
    id: "story",
    name: "Story",
    tagline: "Centred copy on a living mesh gradient, then a pinned scroll-story that walks through every service with its 3D vignette.",
    says: "Narrative and product-led — reads like a keynote.",
    blocks: ["Mesh gradient hero", "Sticky scroll story", "Bento industries", "Testimonial carousel"],
  },
  {
    id: "bento",
    name: "Bento OS",
    tagline: "The hero is a dashboard: headline tile, the live 3D deck, motion numbers, drawn charts and a channels marquee. Services expand like an image accordion.",
    says: "Feels like a product, not a brochure — strongest for the tech side.",
    blocks: ["Bento hero with live tiles", "Motion numbers", "Image accordion", "Spotlight cards"],
  },
  {
    id: "reveal",
    name: "Reveal",
    tagline: "Scrolling opens a clip-path window onto the command deck until it fills the screen, then editorial sections with word-by-word text reveal.",
    says: "Cinematic first impression, the most 'wow' on a first visit.",
    blocks: ["Clip-path scroll reveal", "Scroll-word manifesto", "Numbered service stage", "Horizontal work rail"],
  },
];

const icons: Record<ServiceIcon, LucideIcon> = { adtech: Radar, media: Megaphone, performance: Target, software: Braces, web: Globe, mobile: Smartphone, uiux: PenTool, ecommerce: ShoppingBag, data: BarChart3, automation: Workflow };
const panelFor: Partial<Record<ServiceIcon, keyof typeof demoPanels>> = { adtech: "conversions", media: "channels", performance: "roas", data: "spend", ecommerce: "funnel", uiux: "ab", automation: "reach", software: "mix" };

/** Card art: the drawn dashboard where one fits the service, otherwise its icon on a tile. */
function art(icon: ServiceIcon) {
  const key = panelFor[icon];
  if (key) return <PanelImage spec={demoPanels[key]} className="w-full max-w-[420px] rounded-2xl border border-white/12 shadow-[0_30px_60px_-24px_rgba(0,0,0,0.9)]" scale={0.75} />;
  const Icon = icons[icon];
  return (
    <span className="grid size-24 place-items-center rounded-3xl border border-white/12 bg-white/[0.05] text-cyan">
      <Icon className="size-10" strokeWidth={1.5} />
    </span>
  );
}
const withArt = serviceItems.map((it, i) => ({ ...it, art: art(services[i].icon) }));

const manifesto = "Advertising is our core practice. Around it we build the software, products and data that make growth compound — one team for the campaigns, the code and the numbers behind both.";

function Manifesto() {
  return (
    <Section>
      <div className="mx-auto max-w-5xl">
        <span className="label-mono">( manifesto )</span>
        <ScrollWords text={manifesto} className="mt-6 text-[1.7rem] sm:text-4xl lg:text-[3.4rem]" />
      </div>
    </Section>
  );
}

function LabBar({ id }: { id: TemplateId }) {
  const t = templates.find((x) => x.id === id)!;
  return (
    <div className="glass glass-flat fixed bottom-4 right-4 z-[60] flex items-center gap-3 rounded-full py-1.5 pl-4 pr-2 text-[12px] text-white/70 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)]">
      <span>
        Template <b className="text-white">{t.name}</b>
      </span>
      <Link href="/lab/templates" className="inline-flex items-center gap-1 rounded-full bg-white/[0.08] px-3 py-1 font-semibold text-white hover:bg-white/[0.14]">
        <ArrowLeft className="size-3.5" /> All templates
      </Link>
    </div>
  );
}

export function TemplatePage({ id }: { id: TemplateId }) {
  const reduce = !!useReducedMotion();
  return (
    <>
      <Navbar />
      <main className="relative">
        {id === "trail" && (
          <>
            <TrailHero />
            <TextTicker items={["AdTech", "Media Buying", "Performance", "Software", "Data", "Growth"]} />
            <Section id="services">
              <SectionHeading index="01" eyebrow="Services" title="Everything your digital growth" accent="needs." subtitle="Scroll — each service stacks on the last." />
              <StackCards items={withArt} className="mt-14" />
            </Section>
            <Manifesto />
            <TrafficSources />
            <Industries />
            <CaseStudies />
            <Testimonials />
            <CTA />
          </>
        )}
        {id === "story" && (
          <>
            <MeshHero reduce={reduce} />
            <Stats />
            <ServicesStory />
            <Industries />
            <WhyPixelADX />
            <TextTicker items={["We Build Technology", "We Buy Attention", "We Drive Growth"]} reverse />
            <CaseStudies />
            <Testimonials />
            <GlobalReach />
            <CTA />
          </>
        )}
        {id === "bento" && (
          <>
            <BentoHero reduce={reduce} />
            <TextTicker items={["AdTech", "Media Buying", "Performance", "Software", "Data", "Growth"]} className="mt-16" />
            <Section id="services">
              <SectionHeading index="01" eyebrow="Services" title="Everything your digital growth" accent="needs." subtitle="Hover a panel to open it." />
              <ImageAccordion items={withArt.slice(0, 6)} className="mt-14" />
            </Section>
            <TrafficSources />
            <Industries />
            <Process />
            <CaseStudies />
            <CTA />
          </>
        )}
        {id === "reveal" && (
          <>
            <MaskRevealHero reduce={reduce} />
            <Manifesto />
            <ServicesStage />
            <TrafficSources />
            <WhyPixelADX />
            <CaseStudies />
            <Process />
            <GlobalReach />
            <CTA />
          </>
        )}
      </main>
      <Footer />
      <LabBar id={id} />
    </>
  );
}
