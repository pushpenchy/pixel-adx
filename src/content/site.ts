import type { LogoKey } from "./logos";

/**
 * Pixel ADX — site content.
 *
 * Everything marked "placeholder" is intentionally editable and NOT a claim
 * about real results, clients or numbers. Replace with verified content before
 * publishing. This file is the single source of truth for copy across sections.
 */

/** Which 3D concept the hero uses — preview all of them at /lab. */
export const heroScene: "sphere" | "mark" | "knot" | "warp" | "globe" | "deck" | "skyline" | "iso" = "deck";

export const brand = {
  name: "Pixel ADX",
  tagline: "AdTech • Media Buying • Software • Digital Growth",
  coreMessage: ["We Build Technology.", "We Buy Attention.", "We Drive Growth."],
  eyebrow: "PIXEL ADX — ADTECH & DIGITAL TECHNOLOGY",
  description:
    "Pixel ADX combines advertising technology, media buying, software engineering and data-driven digital solutions to help businesses acquire customers, scale campaigns and build better digital products.",
  shortDescription:
    "AdTech, media buying and digital technology solutions built for growth.",
  location: "Bangladesh",
  email: "hello@pixeladx.com", // placeholder — replace with the real address
  phone: "", // e.g. "+880 1XXX XXXXXX" — shown in the contact section once set
  whatsapp: "", // digits only, e.g. "8801XXXXXXXXX" — enables the WhatsApp button once set
  social: {
    facebook: "https://www.facebook.com/pixeladx",
    instagram: "https://www.instagram.com/pixeladx",
    youtube: "https://www.youtube.com/@pixeladx",
    x: "https://x.com/pixeladx",
    linkedin: "https://www.linkedin.com/company/pixeladx",
  },
};

export const nav = [
  { label: "Home", href: "#home" },
  { label: "Services", href: "#services" },
  { label: "AdTech", href: "#adtech" },
  { label: "Media Buying", href: "#media-buying" },
  { label: "Solutions", href: "#technology" },
  { label: "Industries", href: "#industries" },
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

/** Stats strip — qualitative by design. Edit freely; avoid unverifiable numbers. */
export const stats = [
  { value: "24/7", label: "Campaign Monitoring" },
  { value: "Data-Driven", label: "Decision Making" },
  { value: "Multi-Channel", label: "Advertising" },
  { value: "Global", label: "Digital Reach" },
];

export type ServiceIcon =
  | "adtech"
  | "media"
  | "performance"
  | "software"
  | "web"
  | "mobile"
  | "uiux"
  | "ecommerce"
  | "data"
  | "automation";

export type Service = {
  index: string;
  title: string;
  description: string;
  icon: ServiceIcon;
};

export const services: Service[] = [
  { index: "01", title: "AdTech", icon: "adtech", description: "Advertising technology solutions designed around data, automation and scalable acquisition." },
  { index: "02", title: "Media Buying", icon: "media", description: "Strategic media buying and campaign management across digital advertising platforms." },
  { index: "03", title: "Performance Marketing", icon: "performance", description: "Conversion-focused campaigns designed around measurable business outcomes." },
  { index: "04", title: "Software Development", icon: "software", description: "Custom software systems engineered around business requirements." },
  { index: "05", title: "Web Development", icon: "web", description: "Fast, scalable and conversion-focused websites and web applications." },
  { index: "06", title: "Mobile Applications", icon: "mobile", description: "Modern Android and iOS applications with scalable architecture." },
  { index: "07", title: "UI/UX Design", icon: "uiux", description: "Research-driven interfaces that combine usability with premium visual design." },
  { index: "08", title: "E-Commerce", icon: "ecommerce", description: "Scalable digital commerce platforms designed for growth." },
  { index: "09", title: "Data & Analytics", icon: "data", description: "Dashboards, reporting, tracking and data-driven decision systems." },
  { index: "10", title: "Business Automation", icon: "automation", description: "Technology that reduces repetitive work and improves operational efficiency." },
];

export const adtechNodes = [
  "Advertisers",
  "Publishers",
  "Audiences",
  "Campaigns",
  "Traffic",
  "Data",
  "Conversions",
  "Analytics",
];

export const campaignIntelligence = [
  "Audience targeting",
  "Traffic analysis",
  "Conversion tracking",
  "Campaign optimization",
  "Performance reporting",
  "Real-time insights",
];

export const technologyStages = [
  { title: "Discover", description: "Requirements, users, constraints." },
  { title: "Design", description: "Architecture, interfaces, data models." },
  { title: "Build", description: "Engineering, integrations, QA." },
  { title: "Launch", description: "Deployment, tracking, rollout." },
  { title: "Optimize", description: "Performance, UX and conversion iteration." },
  { title: "Scale", description: "Infrastructure and features that grow with you." },
];

export const technologyCapabilities = [
  "Custom Software",
  "Web Platforms",
  "Mobile Apps",
  "APIs",
  "Cloud Infrastructure",
  "Automation",
  "Analytics",
];

export const industries = [
  { name: "FinTech", description: "Secure, compliant platforms and acquisition funnels for financial products." },
  { name: "E-Commerce", description: "Storefronts, catalog systems and paid acquisition built to convert." },
  { name: "SaaS", description: "Product-led growth, trial funnels and retention-focused analytics." },
  { name: "Healthcare", description: "Patient-facing digital products with privacy-first engineering." },
  { name: "Education", description: "Learning platforms and enrollment campaigns that scale." },
  { name: "Real Estate", description: "Lead generation systems and property platforms for developers and agencies." },
  { name: "Retail", description: "Omnichannel experiences that connect stores, apps and campaigns." },
  { name: "Media", description: "Audience monetization, content platforms and ad infrastructure." },
  { name: "Travel", description: "Booking experiences and seasonal campaign systems for demand." },
  { name: "Technology", description: "Engineering partnerships for product teams shipping at speed." },
  { name: "Startups", description: "From MVP to growth engine — build, launch and acquire efficiently." },
  { name: "Professional Services", description: "Digital presence and lead pipelines for expertise-driven firms." },
];

export const whyPixelADX = [
  { title: "Technology First", description: "We solve growth challenges with technology, data and engineering.", icon: "cpu" },
  { title: "Performance Driven", description: "Every campaign and solution is designed around measurable objectives.", icon: "target" },
  { title: "Data Intelligence", description: "Turn digital activity into useful business insights.", icon: "chart" },
  { title: "Long-Term Partnership", description: "Build systems and strategies that can evolve with your business.", icon: "handshake" },
] as const;

export type Hue = "blue" | "cyan" | "violet";

/** Case studies — placeholders. Replace with real, approved client work. */
export const caseStudies: {
  category: string;
  name: string;
  description: string;
  technology: string[];
  services: string[];
  hue: Hue;
}[] = [
  {
    category: "AdTech Platform",
    name: "Project Placeholder One",
    description: "Short project description goes here. Describe the challenge, the approach and the outcome.",
    technology: ["Next.js", "Node.js", "PostgreSQL"],
    services: ["AdTech", "Data & Analytics"],
    hue: "blue",
  },
  {
    category: "Performance Campaign",
    name: "Project Placeholder Two",
    description: "Short project description goes here. Describe the challenge, the approach and the outcome.",
    technology: ["Meta Ads", "Google Ads", "GA4"],
    services: ["Media Buying", "Performance Marketing"],
    hue: "cyan",
  },
  {
    category: "E-Commerce Build",
    name: "Project Placeholder Three",
    description: "Short project description goes here. Describe the challenge, the approach and the outcome.",
    technology: ["React", "Headless Commerce", "Stripe"],
    services: ["E-Commerce", "UI/UX Design"],
    hue: "violet",
  },
  {
    category: "Mobile Product",
    name: "Project Placeholder Four",
    description: "Short project description goes here. Describe the challenge, the approach and the outcome.",
    technology: ["React Native", "Firebase"],
    services: ["Mobile Applications", "Business Automation"],
    hue: "blue",
  },
];

export const processSteps = [
  { index: "01", title: "Discover", description: "Understand the business, the audience and the growth objective." },
  { index: "02", title: "Strategize", description: "Define the technology, media and measurement strategy." },
  { index: "03", title: "Design", description: "Design interfaces, creatives and systems around the user." },
  { index: "04", title: "Build", description: "Engineer the product, campaign infrastructure and integrations." },
  { index: "05", title: "Launch", description: "Ship with tracking, QA and controlled rollout." },
  { index: "06", title: "Optimize", description: "Iterate on data — creatives, targeting, UX and performance." },
  { index: "07", title: "Scale", description: "Expand what works across channels, markets and products." },
];

/** Testimonials — placeholders only. Never publish without real, permitted quotes. */
export const testimonials = [
  { quote: "Client testimonial goes here.", name: "Client Name", role: "Company / Position" },
  { quote: "Client testimonial goes here.", name: "Client Name", role: "Company / Position" },
  { quote: "Client testimonial goes here.", name: "Client Name", role: "Company / Position" },
];

/** Global reach — regions served digitally. These are NOT physical office locations. */
export const reachPoints: { label: string; lon: number; lat: number; home: boolean; labelSide?: "left" | "right" }[] = [
  { label: "Bangladesh", lon: 90.4, lat: 23.8, home: true },
  { label: "Asia", lon: 103.8, lat: 1.35, home: false },
  { label: "Middle East", lon: 55.3, lat: 25.2, home: false, labelSide: "left" as const },
  { label: "Europe", lon: 4.9, lat: 52.4, home: false },
  { label: "North America", lon: -74.0, lat: 40.7, home: false },
];

/**
 * Traffic sources — advertising networks Pixel ADX buys media on.
 * Edit freely; only list platforms you actually run campaigns on.
 * icon: key from src/content/logos.ts (generated from simple-icons).
 * logo: optional path to your own SVG in /public/logos (official press-kit
 * files) — takes precedence over icon. With neither, a monogram chip renders.
 */
export type TrafficSource = { name: string; color: string; mark?: string; icon?: LogoKey; logo?: string };

export const trafficSources: TrafficSource[] = [
  { name: "Meta Ads", color: "#0467df", icon: "meta" },
  { name: "Google Ads", color: "#4285f4", icon: "googleads" },
  { name: "TikTok", color: "#69c9d0", icon: "tiktok" },
  { name: "YouTube", color: "#ff0000", icon: "youtube" },
  { name: "Snapchat", color: "#fffc00", icon: "snapchat" },
  { name: "X Ads", color: "#e7e9ea", icon: "x" },
  { name: "LinkedIn", color: "#0a66c2", icon: "linkedin" },
  { name: "Pinterest", color: "#bd081c", icon: "pinterest" },
  { name: "Reddit", color: "#ff4500", icon: "reddit" },
  { name: "Microsoft Ads", color: "#00a4ef", icon: "microsoft" },
  { name: "DV360", color: "#34a853", icon: "dv360" },
  { name: "Apple Search Ads", color: "#a2aaad", icon: "apple" },
  // Not available in simple-icons — drop official SVGs into /public/logos and set logo.
  { name: "Taboola", color: "#0d6cf2", mark: "Tb" },
  { name: "Outbrain", color: "#f2a900", mark: "Ob" },
  { name: "Teads", color: "#7c4dff", mark: "Td" },
  { name: "NewsBreak", color: "#ff3b30", mark: "NB" },
];

export const footerColumns = [
  { title: "Company", links: [["About", "#about"], ["Services", "#services"], ["Industries", "#industries"], ["Work", "#work"], ["Contact", "#contact"]] },
  { title: "Solutions", links: [["AdTech", "#adtech"], ["Media Buying", "#media-buying"], ["Software", "#technology"], ["Digital Growth", "#services"], ["Analytics", "#services"]] },
  { title: "Resources", links: [["Blog", "#"], ["Insights", "#"], ["Careers", "#"], ["Privacy Policy", "#"], ["Terms", "#"]] },
];
