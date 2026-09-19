/** Template metadata — plain module so server components can read it too. */
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
