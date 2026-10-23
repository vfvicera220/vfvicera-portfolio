"use client";

import { useMemo, useState, type KeyboardEvent } from "react";

// Skill map grouped by where each tool sits in a full-stack app. Years come from
// real usage across roles (no self-rated proficiency). Search + per-job filter.

const NOW = new Date().getFullYear();

type SrcKey = "bb" | "lexi" | "site" | "twist" | "denso";
const SRC: Record<SrcKey, { name: string; short: string; from: number; to: number; color: string }> = {
  bb: { name: "Brain Battle", short: "Brain Battle", from: 2026, to: NOW, color: "#F2A541" },
  lexi: { name: "LexiQuest", short: "LexiQuest", from: 2024, to: 2025, color: "#D9A85C" },
  site: { name: "This portfolio", short: "Portfolio", from: 2024, to: NOW, color: "#C9B8E8" },
  twist: { name: "Twist Resources", short: "Twist", from: 2021, to: NOW, color: "#9BC4A8" },
  denso: { name: "Denso Techno Philippines", short: "Denso", from: 2019, to: 2021, color: "#8AB4F8" },
};
const SRC_ORDER: SrcKey[] = ["bb", "lexi", "site", "twist", "denso"];

type Skill = { id: string; name: string; used: SrcKey[]; alias?: string };
type Layer = { label: string; note: string; skills: Skill[] };

const LAYERS: Layer[] = [
  { label: "client / web", note: "what users see in the browser", skills: [
    { id: "web", name: "HTML · CSS · JS", used: ["twist", "site", "bb"], alias: "html css javascript js" },
    { id: "react", name: "React", used: ["twist", "site", "bb"], alias: "reactjs" },
    { id: "ts", name: "TypeScript", used: ["lexi", "site"], alias: "javascript js" },
    { id: "next", name: "Next.js", used: ["site", "bb"], alias: "nextjs ssr" },
    { id: "tw", name: "Tailwind", used: ["site"], alias: "tailwindcss css" },
  ] },
  { label: "client / mobile", note: "iOS + Android apps", skills: [
    { id: "rn", name: "React Native", used: ["twist", "lexi", "bb"], alias: "reactnative mobile ios android" },
    { id: "expo", name: "Expo", used: ["lexi"], alias: "mobile" },
    { id: "eas", name: "EAS", used: ["lexi"], alias: "expo build mobile" },
    { id: "powersync", name: "PowerSync", used: ["lexi"], alias: "offline sync" },
  ] },
  { label: "api / services", note: "business logic + endpoints", skills: [
    { id: "node", name: "Node.js", used: ["bb"], alias: "nodejs javascript js backend" },
    { id: "java", name: "Java", used: ["twist"], alias: "jvm backend" },
    { id: "spring", name: "Spring Boot", used: ["twist"], alias: "springboot backend" },
  ] },
  { label: "data", note: "where state lives", skills: [
    { id: "pg", name: "PostgreSQL", used: ["twist", "lexi"], alias: "postgres sql database db" },
    { id: "supabase", name: "Supabase", used: ["lexi"], alias: "postgres database db" },
    { id: "turso", name: "Turso", used: ["bb"], alias: "sqlite libsql database db edge" },
  ] },
  { label: "infra / delivery", note: "hosting, edge, CI/CD", skills: [
    { id: "cloudflare", name: "Cloudflare", used: ["bb"], alias: "workers cdn edge pages" },
    { id: "docker", name: "Docker", used: ["lexi"], alias: "containers" },
    { id: "gha", name: "GitHub Actions", used: ["lexi"], alias: "ci cicd github" },
    { id: "jenkins", name: "Jenkins", used: ["denso", "twist"], alias: "ci cicd" },
  ] },
  { label: "systems / desktop", note: "tooling + embedded, early career", skills: [
    { id: "python", name: "Python", used: ["denso", "twist"], alias: "py" },
    { id: "cs", name: "C# · .NET", used: ["denso"], alias: "csharp c# dotnet .net" },
    { id: "vb", name: "Visual Basic", used: ["denso"], alias: "vba vb.net" },
    { id: "cpp", name: "C++", used: ["denso"], alias: "cplusplus c++ embedded" },
  ] },
];
const AI = [
  { name: "Claude", current: true, alias: "ai anthropic llm" },
  { name: "Cursor", current: false, alias: "ai editor" },
  { name: "GitHub Copilot", current: false, alias: "ai github" },
];

const ALL = LAYERS.flatMap((l) => l.skills.map((s) => ({ ...s, layer: l.label })));
const norm = (s: string) => s.toLowerCase().replace(/[\s.\-_·]+/g, "");
const hay = (name: string, layer: string, alias = "") => [name, layer, ...alias.split(" ")].filter(Boolean).map(norm);
const yearsOf = (used: SrcKey[]) => {
  const r = used.map((k) => [SRC[k].from, SRC[k].to]).sort((a, b) => a[0] - b[0]);
  let total = 0, a0 = -1, b0 = -1;
  for (const [a, b] of r) {
    if (a > b0) { if (b0 >= 0) total += b0 - a0; a0 = a; b0 = b; } else b0 = Math.max(b0, b);
  }
  if (b0 >= 0) total += b0 - a0;
  return Math.max(1, total);
};
const yrs = (n: number) => `${n} yr${n === 1 ? "" : "s"}`;

function Hl({ text, q }: { text: string; q: string }) {
  const i = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (i < 0) return <>{text}</>;
  return (<>{text.slice(0, i)}<mark className="st-mark">{text.slice(i, i + q.length)}</mark>{text.slice(i + q.length)}</>);
}

export default function SkillLayers() {
  const [job, setJob] = useState<SrcKey | null>(null);
  const [sel, setSel] = useState("react");
  const [query, setQuery] = useState("");
  const q = query.trim();

  const hits = useMemo(() => {
    if (!q) return null;
    const n = norm(q);
    return new Set(ALL.filter((s) => hay(s.name, s.layer, s.alias).some((h) => h.includes(n))).map((s) => s.id));
  }, [q]);
  const aiHits = useMemo(() => (q ? new Set(AI.filter((a) => hay(a.name, "ai built with", a.alias).some((h) => h.includes(norm(q)))).map((a) => a.name)) : null), [q]);
  const count = (hits?.size ?? 0) + (aiHits?.size ?? 0);

  const onQuery = (v: string) => {
    setQuery(v);
    const n = norm(v.trim());
    const first = n && ALL.find((s) => hay(s.name, s.layer, s.alias).some((h) => h.includes(n)));
    if (first) setSel(first.id);
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") onQuery("");
    if (e.key === "Enter" && hits && hits.size) {
      const list = ALL.filter((s) => hits.has(s.id));
      const i = list.findIndex((s) => s.id === sel);
      setSel(list[(i + (e.shiftKey ? list.length - 1 : 1)) % list.length].id);
    }
  };

  const cur = ALL.find((s) => s.id === sel)!;
  const curY = yearsOf(cur.used);

  return (
    <div className="sl">
      <div className="sl-controls">
        <div className="st-search font-mono">
          <span className="st-search-label">$ grep</span>
          <input
            className="st-search-input"
            type="search"
            placeholder="search a skill — e.g. postgres, ci, mobile"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            onKeyDown={onKey}
            aria-label="Search skills"
          />
          <span className="st-search-status" aria-live="polite" style={q && !count ? { color: "#F28B82" } : undefined}>
            {q ? (count ? `${count} match${count === 1 ? "" : "es"}` : "no match") : ""}
          </span>
          {q && (
            <button type="button" className="st-search-clear" onClick={() => onQuery("")}>esc ✕</button>
          )}
        </div>

        <div className="sl-filters font-mono" role="group" aria-label="Show the stack used at">
          <span className="sl-filters-label">stack at:</span>
          {[null, ...SRC_ORDER].map((k) => {
            const on = job === k;
            return (
              <button
                key={k ?? "all"}
                type="button"
                className={`sl-flt${on ? " on" : ""}`}
                aria-pressed={on}
                onClick={() => setJob(k)}
                style={on ? { borderColor: k ? SRC[k].color : "var(--fg)" } : undefined}
              >
                <span className="sl-dot" style={{ background: k ? SRC[k].color : "var(--fg)" }} />
                {k ? SRC[k].short : "everything"}
                {k && <span className="sl-flt-years">{SRC[k].from}–{SRC[k].to === NOW ? "now" : SRC[k].to}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="sl-grid">
        <div className="sl-layers">
          {LAYERS.map((l) => {
            const items = l.skills.map((s) => {
              const qHit = !hits || hits.has(s.id);
              return { s, qHit, lit: (!job || s.used.includes(job)) && qHit };
            });
            const anyLit = items.some((i) => i.lit);
            return (
              <div key={l.label} className={`sl-layer${anyLit ? "" : " dim"}`}>
                <div className="sl-layer-head">
                  <span className="font-mono sl-layer-label">{l.label}</span>
                  <span className="sl-layer-note">{l.note}</span>
                </div>
                <div className="sl-chips">
                  {items.map(({ s, qHit, lit }) => {
                    const on = sel === s.id;
                    const y = yearsOf(s.used);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        className={`sl-chip${on ? " sel" : ""}${lit ? "" : " dim"}${hits && qHit ? " match" : ""}`}
                        aria-pressed={on}
                        onClick={() => setSel(s.id)}
                        style={!on && !(hits && qHit) && lit && job ? { borderColor: SRC[job].color } : undefined}
                      >
                        <span className="sl-chip-name"><Hl text={s.name} q={q} /></span>
                        <span className="font-mono sl-chip-meta">
                          <span className="sl-chip-dots" aria-label={`used at ${s.used.map((k) => SRC[k].short).join(", ")}`}>
                            {SRC_ORDER.filter((k) => s.used.includes(k)).map((k) => (
                              <i key={k} style={{ background: SRC[k].color }} />
                            ))}
                          </span>
                          <span>{yrs(y)}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <aside className="sl-ai">
          <span className="font-mono sl-ai-title">built with / ai</span>
          <span className="sl-layer-note">Not part of the product. How I build it.</span>
          {AI.map((a) => (
            <div key={a.name} className={`sl-ai-row${aiHits && !aiHits.has(a.name) ? " dim" : ""}`}>
              <span className="sl-ai-name" style={{ color: a.current ? "var(--fg)" : "var(--muted-2)" }}><Hl text={a.name} q={q} /></span>
              <span className="font-mono sl-ai-tag" style={{ color: a.current ? "var(--accent)" : "var(--muted-2)" }}>
                {a.current ? "● daily driver" : "used before"}
              </span>
            </div>
          ))}
        </aside>
      </div>

      <div className="sl-detail font-mono" aria-live="polite">
        <span className="sl-detail-name">{cur.name}</span>
        <span><span className="sl-k">layer </span>{cur.layer}</span>
        <span><span className="sl-k">since </span>{Math.min(...cur.used.map((k) => SRC[k].from))}</span>
        <span><span className="sl-k">xp </span>{yrs(curY)}</span>
        <span><span className="sl-k">used at </span>{SRC_ORDER.filter((k) => cur.used.includes(k)).map((k) => SRC[k].short).join(" · ")}</span>
      </div>
      <p className="font-mono sl-foot">each square = a place I used it, in its colour · years are real overlap, not self-rated</p>
    </div>
  );
}
