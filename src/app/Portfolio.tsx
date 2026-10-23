"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";
import CatMascot from "./components/CatMascot";
import SkillLayers from "./components/SkillLayers";
import ContactRequest from "./components/ContactRequest";
import AIPipeline from "./components/AIPipeline";

const ACCENT = "#F2A541";

type Release = {
  version: string;
  latest?: boolean;
  dates: string;
  title: string;
  company: string;
  body: string;
  links?: { label: string; href: string }[];
  stack: string[];
};

const RELEASES: Release[] = [
  {
    version: "v4.0.0 · latest",
    latest: true,
    dates: "Jan 2026 — present",
    title: "Senior Full Stack Developer",
    company: "Brain Battle",
    body: "Building Brain Battle, a gamified SAT and ACT prep app for iOS and Android. Students battle in real time, climb local and global leaderboards, keep streaks and earn rewards while working through a bank of 100,000+ practice questions.",
    links: [
      { label: "brainbattle.app", href: "https://brainbattle.app/" },
      { label: "App Store", href: "https://apps.apple.com/us/app/brain-battle-sat-act-prep/id6748758338" },
      { label: "Google Play", href: "https://play.google.com/store/apps/details?id=com.brainbattle" },
    ],
    stack: ["React Native", "Next.js", "Node.js", "Turso", "Cloudflare"],
  },
  {
    version: "v3.0.0",
    dates: "2024 — 2025",
    title: "Full Stack Developer",
    company: "LexiQuest",
    body: "Brought LexiQuest to life with Felix — a mobile app for learning languages in a straightforward but fun, interactive way. Detailed info for every word, phrase building with AI feedback, and deep-dives into culture, language background and learning strategies.",
    links: [{ label: "LexiQuest on Google Play", href: "https://play.google.com/store/apps/details?id=com.felixsebastian.lexiquest" }],
    stack: ["React Native", "Supabase", "PowerSync", "TypeScript", "Expo", "EAS", "GitHub Actions", "Docker"],
  },
  {
    version: "v2.0.0 · stable",
    latest: true,
    dates: "2021 — present",
    title: "Full Stack Software Engineer",
    company: "Twist Resources",
    body: "Core engineer on a team serving an Australian real estate company. Improve the functionality, stability and efficiency of multiple web and mobile apps that help banks produce more accurate property valuations.",
    stack: ["ReactJS", "React Native", "Java", "Spring Boot", "Python", "PostgreSQL", "Jenkins"],
  },
  {
    version: "v1.0.0 · initial",
    dates: "2019 — 2021",
    title: "Software Engineer",
    company: "Denso Techno Philippines",
    body: "Built tools and scripts to automate internal business processes, and worked on embedded systems for car dashboards in C# and C++. Daily stand-ups, project kick-offs and code reviews.",
    stack: ["C#", ".NET", "C++", "Python", "Visual Basic", "Jenkins"],
  },
];

// `soon` lists platforms that are announced but not released yet
type App = { name: string; build: string; blurb: string; icon: string; links: { store: string; href: string }[]; soon?: string[] };

const APPS: App[] = [
  {
    name: "Brain Battle",
    build: "iOS · Android · Web",
    blurb: "Gamified SAT and ACT prep with real-time battles",
    icon: "/apps/brainbattle.webp",
    links: [
      { store: "App Store", href: "https://apps.apple.com/us/app/brain-battle-sat-act-prep/id6748758338" },
      { store: "Google Play", href: "https://play.google.com/store/apps/details?id=com.brainbattle" },
    ],
    soon: ["Web app"],
  },
  {
    name: "LexiQuest",
    build: "Android",
    blurb: "Language learning with AI feedback",
    icon: "/apps/lexiquest.png",
    links: [{ store: "Google Play", href: "https://play.google.com/store/apps/details?id=com.felixsebastian.lexiquest" }],
  },
  {
    name: "RP Data Mobile",
    build: "iOS · Android",
    blurb: "Property data for real estate professionals",
    icon: "/apps/rpdata.jpg",
    links: [
      { store: "App Store", href: "https://apps.apple.com/app/id962231516" },
      { store: "Google Play", href: "https://play.google.com/store/apps/details?id=au.com.corelogic.rpdatapro" },
    ],
  },
  {
    name: "ValAssist",
    build: "iOS · Android",
    blurb: "Helps residents assist valuers with property valuations",
    icon: "/apps/valassist.webp",
    links: [
      { store: "App Store", href: "https://apps.apple.com/au/app/cotality-valuation-assist/id1579802585" },
      { store: "Google Play", href: "https://play.google.com/store/apps/details?id=au.com.corelogic.cav" },
    ],
  },
  {
    name: "goVAL",
    build: "iOS",
    blurb: "Field app for completing valuation reports",
    icon: "/apps/goval.webp",
    links: [{ store: "App Store", href: "https://apps.apple.com/au/app/goval/id1251788480" }],
  },
];

const WORK_LINES = ["meow.", "ship it.", "npm i catnip", "works on my machine", "scroll for the changelog", "check out the builds"];

const COMMANDS = ["whoami", "cat about.md", "git log --since=2019", "./hire-victor.sh"];
const WORK_COMMANDS = ["whoami", "cat about.md", "git log --since=2019", "ls ./builds"];

function useTypewriter(cmds: string[]) {
  const [typed, setTyped] = useState("");
  useEffect(() => {
    let ci = 0;
    let n = 0;
    let deleting = false;
    let t: number;
    const type = () => {
      const cmd = cmds[ci];
      let delay: number;
      if (!deleting) {
        n++;
        delay = 70 + Math.random() * 70;
        if (n >= cmd.length) {
          n = cmd.length;
          deleting = true;
          delay = 2400;
        }
      } else {
        n--;
        delay = 35;
        if (n <= 0) {
          n = 0;
          deleting = false;
          ci = (ci + 1) % cmds.length;
          delay = 450;
        }
      }
      setTyped(cmd.slice(0, n));
      t = window.setTimeout(type, delay);
    };
    t = window.setTimeout(type, 600);
    return () => window.clearTimeout(t);
  }, [cmds]);
  return typed;
}

const chip: CSSProperties = { padding: "5px 10px", border: "1px solid #2E3237", borderRadius: 6 };
const pill: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  minHeight: 48,
  padding: "0 20px",
  border: "1px solid var(--line-2)",
  borderRadius: 999,
};
const container: CSSProperties = { maxWidth: 1240, margin: "0 auto" };
const h2: CSSProperties = { margin: 0, fontSize: 64, lineHeight: 1, fontWeight: 800, letterSpacing: "-0.03em" };
const eyebrow: CSSProperties = { fontSize: 13, color: ACCENT };

function Shapes() {
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: -1, pointerEvents: "none", overflow: "hidden" }}>
      <div className="shape s2" style={{ left: "92%", top: "34%", width: 36, height: 36, border: "2px solid #2E3237" }} />
      <div className="shape s1" style={{ left: "3%", top: "46%", width: 90, height: 90, border: `2px solid ${ACCENT}`, borderRadius: "50%", opacity: 0.25 }} />
      <div className="shape s6" style={{ left: "64%", top: "54%", width: 120, height: 120, backgroundImage: "radial-gradient(#2E3237 1.5px, transparent 1.5px)", backgroundSize: "20px 20px" }} />
      <div className="shape s5" style={{ left: "22%", top: "60%", width: 12, height: 12, background: ACCENT, opacity: 0.45 }} />
      <div className="shape s3" style={{ left: "90%", top: "90%", width: 40, height: 40 }}>
        <svg width="40" height="40" viewBox="0 0 40 40" style={{ display: "block" }}><path d="M20 4v32M4 20h32" stroke="#2E3237" strokeWidth="3" /></svg>
      </div>
      <div className="shape s7" style={{ left: "-6%", top: "92%", width: 320, height: 320, border: "1px solid #22262A", borderRadius: "50%" }} />
      <div className="shape s1" style={{ left: "6%", top: "6%", width: 140, height: 140, border: "2px solid #2A2E33", borderRadius: "50%" }} />
      <div className="shape s2" style={{ left: "84%", top: "5%", width: 64, height: 64, border: `2px solid ${ACCENT}`, opacity: 0.35 }} />
      <div className="shape s3" style={{ left: "72%", top: "22%", width: 40, height: 40 }}>
        <svg width="40" height="40" viewBox="0 0 40 40" style={{ display: "block" }}><path d="M20 4v32M4 20h32" stroke="#3A3F44" strokeWidth="3" /></svg>
      </div>
      <div className="shape s4" style={{ left: "14%", top: "28%", width: 70, height: 62, opacity: 0.4 }}>
        <svg width="70" height="62" viewBox="0 0 70 62" style={{ display: "block" }}><path d="M35 4L66 58H4Z" fill="none" stroke={ACCENT} strokeWidth="2" /></svg>
      </div>
      <div className="shape s5" style={{ left: "46%", top: "12%", width: 14, height: 14, background: ACCENT, opacity: 0.5 }} />
      <div className="shape s6" style={{ left: "86%", top: "70%", width: 140, height: 140, backgroundImage: "radial-gradient(#33383D 1.5px, transparent 1.5px)", backgroundSize: "20px 20px" }} />
      <div className="shape s7" style={{ left: "58%", top: "16%", width: 280, height: 280, border: "1px solid #22262A", borderRadius: "50%" }} />
      <div className="shape s8" style={{ left: "30%", top: "80%", width: 10, height: 10, background: "#3A3F44" }} />
      <div className="shape s3" style={{ left: "38%", top: "4%", width: 24, height: 24, border: "2px solid #2E3237", transform: "rotate(45deg)" }} />
    </div>
  );
}

// `contact={false}` renders the Upwork-safe version (/work): work samples only,
// with no contact form or hire/contact calls to action.
export default function Portfolio({ contact = true }: { contact?: boolean }) {
  const typed = useTypewriter(contact ? COMMANDS : WORK_COMMANDS);

  return (
    <div style={{ minHeight: "100vh", position: "relative", isolation: "isolate" }}>
      <Shapes />

      {/* NAV */}
      <header
        className="sec-pad"
        style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(17,19,21,0.88)", backdropFilter: "blur(10px)", borderBottom: "1px solid var(--line)", padding: "0 56px" }}
      >
        <nav aria-label="Primary" style={{ ...container, height: 68, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
          <a href="#top" className="font-mono" style={{ fontSize: 15, fontWeight: 500, letterSpacing: "0.02em" }}>
            vfv<span style={{ color: ACCENT }}>/</span>portfolio
          </a>
          <div className="navlinks font-mono" style={{ display: "flex", gap: 32, fontSize: 13 }}>
            <a href="#about">about</a>
            <a href="#log">changelog</a>
            <a href="#builds">builds</a>
            <a href="#skills">skills</a>
            <a href="#ai">ai</a>
            {contact && <a href="#contact">contact</a>}
          </div>
          {contact ? (
            <a href="#contact" className="font-mono" style={{ ...pill, minHeight: 44, padding: "0 16px", fontSize: 13 }}>
              hire&nbsp;me&nbsp;→
            </a>
          ) : (
            <span aria-hidden="true" />
          )}
        </nav>
      </header>

      {/* HERO */}
      <section id="top" className="sec-pad" style={{ padding: "120px 56px 96px" }}>
        <div id="about" style={{ ...container, display: "flex", flexDirection: "column", gap: 40 }}>
          <div className="font-mono" style={{ fontSize: 13, color: "var(--muted)", display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ color: ACCENT }}>$</span>
            <span style={{ whiteSpace: "pre" }}>{typed}</span>
            <span className="caret" style={{ width: 9, height: 18, marginLeft: -8, background: ACCENT, display: "inline-block" }} />
          </div>
          <h1 className="hero-name" style={{ margin: 0, fontSize: 132, lineHeight: 0.9, fontWeight: 800, letterSpacing: "-0.045em" }}>
            Victor Francis
            <br />
            Vicera<span style={{ color: ACCENT }}>.</span>
          </h1>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 48, alignItems: "flex-end", justifyContent: "space-between" }}>
            <p style={{ margin: 0, maxWidth: 620, fontSize: 22, lineHeight: 1.5, color: "var(--fg-2)" }}>
              Full-stack software engineer with <strong style={{ color: "var(--fg)", fontWeight: 600 }}>6+ years</strong> of professional experience across
              frontend, backend and mobile. I ship web and mobile apps end to end.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="#log" style={{ ...pill, minHeight: 52, padding: "0 24px", border: "none", background: ACCENT, color: "#111315", fontWeight: 600, fontSize: 16 }}>
                Read the changelog
              </a>
              {contact && (
                <a href="#contact" style={{ ...pill, minHeight: 52, padding: "0 24px", fontSize: 16 }}>
                  Request contact
                </a>
              )}
            </div>
          </div>
          <div
            className="font-mono"
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", fontSize: 13 }}
          >
            {[
              ["experience", "2019 → now"],
              ["focus", "Full-stack"],
              ["current", "Brain Battle · Twist"],
              ["latest build", "Brain Battle"],
            ].map(([k, val]) => (
              <div key={k} style={{ padding: "20px 0", display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ color: "var(--muted-2)" }}>{k}</span>
                <span style={{ fontSize: 15 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHANGELOG */}
      <section id="log" className="sec-pad" style={{ padding: "96px 56px", borderTop: "1px solid var(--line)" }}>
        <div style={{ ...container, display: "flex", flexDirection: "column", gap: 56 }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <span className="font-mono" style={eyebrow}>01 — CHANGELOG.md</span>
              <h2 className="big-h2" style={h2}>Release history</h2>
            </div>
            <p style={{ margin: 0, maxWidth: 380, color: "var(--muted)", fontSize: 16 }}>Every role, versioned. Newest first.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", borderBottom: "1px solid var(--line)" }}>
            {RELEASES.map((r) => (
              <article key={r.version} className="log-row" style={{ display: "flex", gap: 48, padding: "40px 0", borderTop: "1px solid var(--line)" }}>
                <div className="log-side" style={{ width: 240, flexShrink: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                  <span
                    className="font-mono"
                    style={{
                      alignSelf: "flex-start",
                      fontSize: 13,
                      padding: "4px 10px",
                      borderRadius: 6,
                      background: r.latest ? "rgba(242,165,65,0.14)" : "#1C1F22",
                      color: r.latest ? ACCENT : "#B9B6AE",
                    }}
                  >
                    {r.version}
                  </span>
                  <span className="font-mono" style={{ fontSize: 14, color: "var(--muted)" }}>{r.dates}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
                  <h3 style={{ margin: 0, fontSize: 30, lineHeight: 1.2, fontWeight: 600, letterSpacing: "-0.01em" }}>
                    {r.title} <span style={{ color: "var(--muted-2)", fontWeight: 400 }}>@ {r.company}</span>
                  </h3>
                  <p style={{ margin: 0, color: "var(--fg-2)", maxWidth: 760 }}>{r.body}</p>
                  {r.links && (
                    <div className="font-mono" style={{ display: "flex", flexWrap: "wrap", columnGap: 20, fontSize: 14 }}>
                      {r.links.map((l) => (
                        <a key={l.href} href={l.href} style={{ color: ACCENT, padding: "4px 0" }}>
                          {l.label} ↗
                        </a>
                      ))}
                    </div>
                  )}
                  {r.stack.length > 0 && (
                    <div className="font-mono" style={{ display: "flex", flexWrap: "wrap", gap: 8, fontSize: 12, color: "#B9B6AE" }}>
                      {r.stack.map((s) => (
                        <span key={s} style={chip}>{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* BUILDS */}
      <section id="builds" className="sec-pad" style={{ padding: "96px 56px", background: "rgba(22,25,28,0.72)", borderTop: "1px solid var(--line)" }}>
        <div style={{ ...container, display: "flex", flexDirection: "column", gap: 56 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <span className="font-mono" style={eyebrow}>02 — /builds</span>
            <h2 className="big-h2" style={h2}>Shipped apps</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
            {APPS.map((a) => (
              <article key={a.name} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div
                  style={{
                    aspectRatio: "1 / 1",
                    borderRadius: 20,
                    background: "#1E2226",
                    border: "1px solid #2A2E33",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <Image
                    src={a.icon}
                    alt={`${a.name} app icon`}
                    width={160}
                    height={160}
                    style={{ width: "46%", height: "auto", borderRadius: "22%", boxShadow: "0 12px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06)" }}
                  />
                  <span className="font-mono" style={{ position: "absolute", top: 14, right: 14, fontSize: 11, color: "var(--muted-2)" }}>{a.build}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <h3 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>{a.name}</h3>
                  <span style={{ fontSize: 15, color: "var(--muted)" }}>{a.blurb}</span>
                  <div className="font-mono" style={{ display: "flex", flexWrap: "wrap", columnGap: 16 }}>
                    {a.links.map((l) => (
                      <a key={l.href} href={l.href} style={{ fontSize: 13, color: ACCENT, padding: "6px 0" }}>
                        {l.store} ↗
                      </a>
                    ))}
                    {a.soon?.map((s) => (
                      <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--muted)", padding: "6px 0" }}>
                        {s}
                        <span style={{ fontSize: 10, padding: "2px 6px", border: `1px dashed ${ACCENT}`, color: ACCENT, letterSpacing: "0.04em" }}>coming soon</span>
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SKILL MAP */}
      <section id="skills" className="sec-pad" style={{ padding: "96px 56px", borderTop: "1px solid var(--line)" }}>
        <div style={{ ...container, display: "flex", flexDirection: "column", gap: 56 }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <span className="font-mono" style={eyebrow}>03 — skill-map</span>
              <h2 className="big-h2" style={h2}>The stack, layer by layer</h2>
            </div>
            <p style={{ margin: 0, maxWidth: 380, color: "var(--muted)", fontSize: 16 }}>
              Grouped by where each tool sits in a full-stack app. Search a skill, or pick a job to light up the stack I shipped there.
            </p>
          </div>
          <SkillLayers />
        </div>
      </section>

      {/* AI WORKFLOW */}
      <section id="ai" className="sec-pad" style={{ padding: "96px 56px", borderTop: "1px solid var(--line)" }}>
        <div style={{ ...container, display: "flex", flexDirection: "column", gap: 40 }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <span className="font-mono" style={eyebrow}>04 — .github/workflows/ship.yml</span>
              <h2 className="big-h2" style={h2}>How I build with AI</h2>
            </div>
            <p style={{ margin: 0, maxWidth: 380, color: "var(--muted)", fontSize: 16 }}>
              I own the plan and the bar for done. AI does the heavy lifting in between — and nothing ships until it passes my review.
            </p>
          </div>
          <AIPipeline accent={ACCENT} />
        </div>
      </section>

      {/* CONTACT (hidden on the Upwork-safe /work page) */}
      {contact ? (
        <section id="contact" className="sec-pad" style={{ padding: "120px 56px 72px", borderTop: "1px solid var(--line)" }}>
          <div style={{ ...container, display: "flex", flexDirection: "column", gap: 48 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <span className="font-mono" style={eyebrow}>05 — open an issue</span>
              <h2 className="big-h2" style={{ ...h2, fontSize: 88, lineHeight: 0.95, letterSpacing: "-0.04em", maxWidth: 900 }}>
                Have something to build?
              </h2>
            </div>
            <p style={{ margin: 0, maxWidth: 620, fontSize: 18, color: "var(--fg-2)" }}>
              My email and socials are shared on request. Tell me who you are and what it&apos;s about, and I&apos;ll reply with the
              details you need.
            </p>
            <ContactRequest accent={ACCENT} />
            <footer
              className="font-mono"
              style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 16, paddingTop: 32, marginTop: 48, borderTop: "1px solid var(--line)", fontSize: 12, color: "var(--muted-2)" }}
            >
              <span>© {new Date().getFullYear()} Victor Francis Vicera</span>
              <span>Thanks for scrolling. EOF</span>
            </footer>
          </div>
        </section>
      ) : (
        <section className="sec-pad" style={{ padding: "0 56px 72px" }}>
          <div style={container}>
            <footer
              className="font-mono"
              style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 16, paddingTop: 32, marginTop: 48, borderTop: "1px solid var(--line)", fontSize: 12, color: "var(--muted-2)" }}
            >
              <span>© {new Date().getFullYear()} Victor Francis Vicera</span>
              <span>Thanks for scrolling. EOF</span>
            </footer>
          </div>
        </section>
      )}

      <CatMascot accent={ACCENT} lines={contact ? undefined : WORK_LINES} />
    </div>
  );
}
