"use client";

import { useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Eyebrow } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { TextReveal } from "@/components/ui/TextReveal";
import { brand, services } from "@/content/site";
import { cn } from "@/lib/utils";

/**
 * Closing "Get in touch" section: contact details on the left, a project
 * brief form on the right. The form has no backend yet — on submit it opens
 * the visitor's email app with the brief pre-filled (and, when a WhatsApp
 * number is set in content, offers WhatsApp too).
 */
const budgets = ["Not sure yet", "Under $2k", "$2k – $10k", "$10k – $50k", "$50k+"];

type Field = { name: string; company: string; email: string; phone: string; service: string; budget: string; message: string };
const empty: Field = { name: "", company: "", email: "", phone: "", service: services[0].title, budget: budgets[0], message: "" };

const fieldCls =
  "h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-[15px] text-white placeholder:text-white/35 transition-[border-color,box-shadow,background-color] duration-300 focus:border-cyan/50 focus:bg-white/[0.06] focus:outline-none focus:ring-4 focus:ring-cyan/10";
const labelCls = "mb-2 block text-[13px] font-semibold text-white/80";

function buildBrief(f: Field) {
  const lines = [`Name: ${f.name}`];
  if (f.company) lines.push(`Company: ${f.company}`);
  lines.push(`Email: ${f.email}`);
  if (f.phone) lines.push(`Phone / WhatsApp: ${f.phone}`);
  lines.push(`Service: ${f.service}`, `Budget: ${f.budget}`, "", f.message);
  return lines.join("\n");
}

export function Contact() {
  const reduce = useReducedMotion();
  const [f, setF] = useState<Field>(empty);
  const [sent, setSent] = useState(false);
  const set = (k: keyof Field) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const subject = `Project brief — ${f.service} (${f.name}${f.company ? `, ${f.company}` : ""})`;
    window.location.href = `mailto:${brand.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildBrief(f))}`;
    setSent(true);
  };

  const wa = brand.whatsapp ? `https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(f.message ? buildBrief(f) : "Hi Pixel ADX — I'd like to talk about a project.")}` : null;

  const rows = [
    { Icon: Mail, label: "Email", value: brand.email, href: `mailto:${brand.email}` },
    brand.phone ? { Icon: Phone, label: "Phone / WhatsApp", value: brand.phone, href: `tel:${brand.phone.replace(/\s+/g, "")}` } : null,
    { Icon: MapPin, label: "Based in", value: `${brand.location} — working with clients worldwide` },
    { Icon: Clock, label: "Response time", value: "Within one business day" },
  ].filter(Boolean) as { Icon: typeof Mail; label: string; value: string; href?: string }[];

  return (
    <section id="contact" className="relative scroll-mt-20 py-16 sm:py-28 lg:py-36">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          {/* ── details */}
          <div className="lg:pt-6">
            <Eyebrow index="12">Get in touch</Eyebrow>
            <h2 className="mt-6 font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] text-white sm:text-5xl lg:text-[3.6rem]">
              <TextReveal text="Let's build something" />
              <br />
              <span className="serif-accent text-[1.08em]">
                <TextReveal text="exceptional together." gradient delay={0.2} />
              </span>
            </h2>
            <Reveal delay={0.25}>
              <p className="mt-6 max-w-md text-base leading-relaxed text-mute sm:text-[17px]">
                Tell us what you&apos;re building, scaling or trying to fix — campaigns, software, product or data — and we&apos;ll come back with an approach, a timeline and pricing.
              </p>
            </Reveal>

            <Reveal delay={0.35}>
              <dl className="hairline mt-10 divide-y divide-white/10 border-y border-white/10">
                {rows.map(({ Icon, label, value, href }) => (
                  <div key={label} className="grid grid-cols-[2.25rem_1fr] items-start gap-x-3 py-5">
                    <span className="grid size-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-cyan">
                      <Icon className="size-4" strokeWidth={1.8} />
                    </span>
                    <div>
                      <dt className="label-mono text-white/45">{label}</dt>
                      <dd className="mt-1 font-display text-[15px] font-semibold text-white sm:text-base">
                        {href ? (
                          <a href={href} className="transition-colors hover:text-cyan">
                            {value}
                          </a>
                        ) : (
                          value
                        )}
                      </dd>
                    </div>
                  </div>
                ))}
              </dl>
            </Reveal>

            {wa && (
              <Reveal delay={0.45} className="mt-8">
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="liquid-press inline-flex h-12 items-center gap-2.5 rounded-full bg-[#25d366] px-6 text-[15px] font-semibold text-[#062b16] shadow-[0_10px_30px_-10px_rgba(37,211,102,0.7)]"
                >
                  <MessageCircle className="size-[18px]" strokeWidth={2.2} />
                  WhatsApp us
                </a>
              </Reveal>
            )}
          </div>

          {/* ── form */}
          <Reveal delay={0.15}>
            <form onSubmit={submit} className="crystal relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-ink-2/70 p-5 sm:rounded-[2rem] sm:p-8 lg:p-10" noValidate>
              {/* moving light field */}
              <motion.div
                aria-hidden
                animate={reduce ? undefined : { x: ["-10%", "12%", "-10%"], y: ["-8%", "10%", "-8%"] }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                className="pointer-events-none absolute -left-1/3 -top-1/2 -z-[1] h-[120%] w-[80%] rounded-full bg-[radial-gradient(closest-side,rgba(77,124,254,0.22),transparent)] blur-3xl will-change-transform"
              />
              <motion.div
                aria-hidden
                animate={reduce ? undefined : { x: ["10%", "-12%", "10%"], y: ["8%", "-8%", "8%"] }}
                transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
                className="pointer-events-none absolute -bottom-1/2 -right-1/3 -z-[1] h-[120%] w-[80%] rounded-full bg-[radial-gradient(closest-side,rgba(139,92,246,0.2),transparent)] blur-3xl will-change-transform"
              />
              <div aria-hidden className="absolute inset-0 -z-[1] bg-ink-2/80" />

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="c-name" className={labelCls}>
                    Full name
                  </label>
                  <input id="c-name" name="name" autoComplete="name" required value={f.name} onChange={set("name")} className={fieldCls} />
                </div>
                <div>
                  <label htmlFor="c-company" className={labelCls}>
                    Company
                  </label>
                  <input id="c-company" name="company" autoComplete="organization" value={f.company} onChange={set("company")} className={fieldCls} />
                </div>
                <div>
                  <label htmlFor="c-email" className={labelCls}>
                    Email
                  </label>
                  <input id="c-email" name="email" type="email" autoComplete="email" required value={f.email} onChange={set("email")} className={fieldCls} />
                </div>
                <div>
                  <label htmlFor="c-phone" className={labelCls}>
                    Phone / WhatsApp
                  </label>
                  <input id="c-phone" name="phone" type="tel" autoComplete="tel" value={f.phone} onChange={set("phone")} className={fieldCls} />
                </div>
                <div>
                  <label htmlFor="c-service" className={labelCls}>
                    What do you need?
                  </label>
                  <div className="relative">
                    <select id="c-service" name="service" value={f.service} onChange={set("service")} className={cn(fieldCls, "appearance-none pr-10 [&_option]:bg-ink-2 [&_option]:text-white")}>
                      {services.map((s) => (
                        <option key={s.title} value={s.title}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-white/50" />
                  </div>
                </div>
                <div>
                  <label htmlFor="c-budget" className={labelCls}>
                    Budget range
                  </label>
                  <div className="relative">
                    <select id="c-budget" name="budget" value={f.budget} onChange={set("budget")} className={cn(fieldCls, "appearance-none pr-10 [&_option]:bg-ink-2 [&_option]:text-white")}>
                      {budgets.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-white/50" />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="c-message" className={labelCls}>
                    Tell us about the project
                  </label>
                  <textarea
                    id="c-message"
                    name="message"
                    rows={5}
                    required
                    value={f.message}
                    onChange={set("message")}
                    placeholder="Goals, platforms, current numbers, timeline…"
                    className={cn(fieldCls, "h-auto resize-y py-3.5")}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="group liquid-press relative mt-6 flex h-13 w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-[linear-gradient(120deg,#4d7cfe,#6d8cff_45%,#8b5cf6)] text-[15px] font-semibold text-pure-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.45),inset_0_-1px_0_0_rgba(0,0,0,0.15),0_10px_30px_-10px_rgba(77,124,254,0.7)] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),inset_0_-1px_0_0_rgba(0,0,0,0.15),0_14px_40px_-10px_rgba(77,124,254,0.9)]"
              >
                <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[linear-gradient(120deg,transparent_20%,rgb(var(--fg)/0.18)_50%,transparent_80%)] bg-[length:200%_100%] animate-shimmer" />
                <span className="relative">Send project brief</span>
                <ArrowRight className="relative size-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.2} />
              </button>

              <p className="mt-4 text-center text-[13px] text-white/50" aria-live="polite">
                {sent ? (
                  <>
                    Your email app should open with the brief filled in — or write to{" "}
                    <a href={`mailto:${brand.email}`} className="text-white/80 underline-offset-4 hover:underline">
                      {brand.email}
                    </a>
                    .
                  </>
                ) : (
                  "We typically reply within one business day."
                )}
              </p>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
