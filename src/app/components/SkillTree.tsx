"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";

// Game-style skill tree. Levels are derived from real usage: the years each
// skill was used across roles/projects (no self-rated proficiency).

const NOW = new Date().getFullYear();

type Source = { name: string; from: number; to: number };
const SRC: Record<string, Source> = {
  denso: { name: "Denso Techno Philippines", from: 2019, to: 2021 },
  twist: { name: "Twist Resources", from: 2021, to: NOW },
  lexi: { name: "LexiQuest", from: 2024, to: 2025 },
  site: { name: "This portfolio", from: 2024, to: NOW },
  bb: { name: "Brain Battle", from: 2026, to: NOW },
};

// `status` marks tools without dated usage (shown as current/past instead of a level)
type Skill = { id: string; name: string; used: (keyof typeof SRC)[]; status?: "current" | "past"; note?: string; kids?: Skill[] };
type Branch = { id: string; name: string; roots: Skill[]; row?: boolean };

const BRANCHES: Branch[] = [
  {
    id: "frontend",
    name: "frontend/",
    roots: [{
      id: "web", name: "HTML · CSS · JS", used: ["twist", "site", "bb"],
      kids: [
        {
          id: "react", name: "React", used: ["twist", "site", "bb"],
          kids: [
            { id: "ts", name: "TypeScript", used: ["lexi", "site"] },
            { id: "next", name: "Next.js", used: ["site", "bb"], kids: [{ id: "tw", name: "Tailwind", used: ["site"] }] },
          ],
        },
      ],
    }],
  },
  {
    id: "mobile",
    name: "mobile/",
    roots: [{
      id: "rn", name: "React Native", used: ["twist", "lexi", "bb"],
      kids: [
        { id: "expo", name: "Expo", used: ["lexi"], kids: [{ id: "eas", name: "EAS", used: ["lexi"] }] },
        { id: "powersync", name: "PowerSync", used: ["lexi"] },
      ],
    }],
  },
  {
    id: "backend",
    name: "backend/",
    roots: [{
      id: "java", name: "Java", used: ["twist"],
      kids: [
        { id: "spring", name: "Spring Boot", used: ["twist"] },
        { id: "pg", name: "PostgreSQL", used: ["twist", "lexi"], kids: [{ id: "supabase", name: "Supabase", used: ["lexi"] }] },
      ],
    },
    { id: "node", name: "Node.js", used: ["bb"], kids: [{ id: "turso", name: "Turso", used: ["bb"] }] }],
  },
  {
    id: "devops",
    name: "devops/",
    roots: [{
      id: "docker", name: "Docker", used: ["lexi"],
      kids: [
        { id: "gha", name: "GitHub Actions", used: ["lexi"] },
        { id: "jenkins", name: "Jenkins", used: ["denso", "twist"] },
      ],
    },
    { id: "cloudflare", name: "Cloudflare", used: ["bb"] }],
  },
  {
    id: "systems",
    name: "systems/",
    roots: [{
      id: "python", name: "Python", used: ["denso", "twist"],
      kids: [
        { id: "cs", name: "C# · .NET", used: ["denso"], kids: [{ id: "vb", name: "Visual Basic", used: ["denso"] }] },
        { id: "cpp", name: "C++", used: ["denso"] },
      ],
    }],
  },
  {
    id: "ai",
    name: "ai/",
    row: true,
    roots: [
      { id: "claude", name: "Claude", used: [], status: "current" },
      { id: "cursor", name: "Cursor", used: [], status: "past" },
      { id: "copilot", name: "GitHub Copilot", used: [], status: "past" },
    ],
  },
];

// extra search terms per skill (so "postgres", "nodejs", "c#" etc. all match)
const ALIASES: Record<string, string[]> = {
  web: ["html", "css", "javascript", "js"],
  react: ["reactjs"],
  ts: ["ts", "javascript"],
  next: ["nextjs"],
  tw: ["tailwindcss", "css"],
  rn: ["reactnative", "mobile", "ios", "android"],
  eas: ["expo application services"],
  powersync: ["offline", "sync"],
  java: ["jvm"],
  spring: ["springboot"],
  pg: ["postgres", "sql", "database", "db"],
  supabase: ["postgres", "database", "db"],
  node: ["nodejs", "javascript", "js"],
  turso: ["sqlite", "libsql", "database", "db", "edge"],
  docker: ["containers"],
  gha: ["ci", "cicd", "github"],
  jenkins: ["ci", "cicd"],
  cloudflare: ["workers", "cdn", "pages"],
  python: ["py"],
  cs: ["csharp", "c#", "dotnet", ".net"],
  cpp: ["cplusplus", "c++", "embedded"],
  vb: ["vb", "vba", "vb.net"],
  claude: ["ai", "anthropic", "llm"],
  cursor: ["ai", "editor"],
  copilot: ["ai", "github"],
};

// lowercase and drop spaces/dots/dashes so "Node.js" == "nodejs" == "node js"
const norm = (s: string) => s.toLowerCase().replace(/[\s.\-_·]+/g, "");

type Flat = { skill: Skill; branch: Branch; hay: string };
const FLAT: Flat[] = BRANCHES.flatMap((b) => {
  const out: Flat[] = [];
  const walk = (s: Skill) => {
    out.push({ skill: s, branch: b, hay: [s.name, b.id, ...(ALIASES[s.id] ?? [])].map(norm).join("|") });
    s.kids?.forEach(walk);
  };
  b.roots.forEach(walk);
  return out;
});

// wrap the matched part of a name in <mark>
function Highlight({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="st-mark">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

function years(s: Skill) {
  // union of the year ranges of every source that used this skill
  const ranges = s.used.map((k) => [SRC[k].from, SRC[k].to] as const).sort((a, b) => a[0] - b[0]);
  let total = 0;
  let curA = -1;
  let curB = -1;
  for (const [a, b] of ranges) {
    if (a > curB) {
      if (curB >= 0) total += curB - curA;
      curA = a;
      curB = b;
    } else curB = Math.max(curB, b);
  }
  if (curB >= 0) total += curB - curA;
  return Math.max(1, total);
}
const level = (y: number) => (y >= 5 ? 5 : y >= 3 ? 4 : y >= 2 ? 3 : y >= 1 ? 2 : 1);
const since = (s: Skill) => Math.min(...s.used.map((k) => SRC[k].from));

function find(id: string): { skill: Skill; branch: Branch } | null {
  for (const b of BRANCHES) {
    const stack = [...b.roots];
    while (stack.length) {
      const s = stack.pop()!;
      if (s.id === id) return { skill: s, branch: b };
      stack.push(...(s.kids ?? []));
    }
  }
  return null;
}

function Pips({ n }: { n: number }) {
  return (
    <span className="st-pips" aria-label={`level ${n} of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <i key={i} className={i <= n ? "on" : ""} />
      ))}
    </span>
  );
}

function Status({ s }: { s: Skill }) {
  return <span className={`st-status ${s.status}`}>{s.status === "current" ? "● current" : "past"}</span>;
}

type NodeProps = { s: Skill; sel: string; onSel: (id: string) => void; q: string; hits: Set<string> | null };

function Node({ s, sel, onSel, q, hits }: NodeProps) {
  const lv = s.status ? (s.status === "current" ? 5 : 2) : level(years(s));
  const state = hits ? (hits.has(s.id) ? " match" : " dim") : "";
  return (
    <li className="st-li">
      <button
        type="button"
        data-skill={s.id}
        className={`st-node lv${lv}${sel === s.id ? " sel" : ""}${state}`}
        onClick={() => onSel(s.id)}
        onMouseEnter={() => onSel(s.id)}
        onFocus={() => onSel(s.id)}
        aria-pressed={sel === s.id}
      >
        <span className="st-gem" aria-hidden="true" />
        <span className="st-name">
          <Highlight text={s.name} q={q} />
        </span>
        {s.status ? <Status s={s} /> : <Pips n={lv} />}
      </button>
      {s.kids && (
        <ul className="st-ul">
          {s.kids.map((k) => (
            <Node key={k.id} s={k} sel={sel} onSel={onSel} q={q} hits={hits} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function SkillTree() {
  const [sel, setSel] = useState("react");
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const q = query.trim();
  const matches = useMemo(() => (q ? FLAT.filter((f) => f.hay.includes(norm(q))) : []), [q]);
  const hits = q ? new Set(matches.map((m) => m.skill.id)) : null;

  // jump the details panel to the first match as you type
  useEffect(() => {
    if (matches.length) setSel(matches[0].skill.id);
  }, [matches]);

  const focusMatch = (dir: 1 | -1) => {
    if (!matches.length) return;
    const i = matches.findIndex((m) => m.skill.id === sel);
    const next = matches[(i + dir + matches.length) % matches.length].skill.id;
    setSel(next);
    wrapRef.current?.querySelector(`[data-skill="${next}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      focusMatch(e.shiftKey ? -1 : 1);
    } else if (e.key === "Escape") {
      setQuery("");
    }
  };

  const found = find(sel);
  const s = found?.skill;
  const y = s ? years(s) : 0;

  return (
    <div className="st-wrap" ref={wrapRef}>
      <div className="st-search font-mono">
        <label htmlFor="skill-search" className="st-search-label">
          $ grep
        </label>
        <input
          id="skill-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKey}
          placeholder="search skills — react, postgres, ci, ai…"
          autoComplete="off"
          spellCheck={false}
          aria-describedby="skill-search-status"
          className="st-search-input"
        />
        {q && (
          <button type="button" className="st-search-clear" onClick={() => setQuery("")} aria-label="Clear search">
            esc ✕
          </button>
        )}
        <span id="skill-search-status" className="st-search-status" aria-live="polite">
          {q ? (matches.length ? `${matches.length} match${matches.length === 1 ? "" : "es"}${matches.length > 1 ? " · ↵ next" : ""}` : "no match") : ""}
        </span>
      </div>
      <div className={`st-branches${q ? " searching" : ""}`}>
        {BRANCHES.map((b) => (
          <div key={b.id} className={`st-branch${b.row ? " st-branch-row" : ""}`}>
            <div className="font-mono st-branch-name">{b.name}</div>
            <div className="st-roots">
              {b.roots.map((r) => (
                <ul key={r.id} className="st-ul st-root">
                  <Node s={r} sel={sel} onSel={setSel} q={q} hits={hits} />
                </ul>
              ))}
            </div>
          </div>
        ))}
      </div>

      {s && found && (
        <div className="st-panel font-mono" aria-live="polite">
          <div className="st-panel-head">
            <span className="st-panel-branch">{found.branch.name}</span>
            <span className="st-panel-name">{s.name}</span>
            {s.status ? <Status s={s} /> : <Pips n={level(y)} />}
          </div>
          {s.status ? (
            <dl className="st-stats">
              <div>
                <dt>status</dt>
                <dd>{s.status === "current" ? "Using it right now" : "Used previously"}</dd>
              </div>
              {s.note && (
                <div>
                  <dt>notes</dt>
                  <dd>{s.note}</dd>
                </div>
              )}
            </dl>
          ) : (
            <dl className="st-stats">
              <div>
                <dt>since</dt>
                <dd>{since(s)}</dd>
              </div>
              <div>
                <dt>xp</dt>
                <dd>
                  {y} yr{y === 1 ? "" : "s"}
                </dd>
              </div>
              <div>
                <dt>used at</dt>
                <dd>{s.used.map((k) => SRC[k].name).join(" · ")}</dd>
              </div>
            </dl>
          )}
        </div>
      )}
    </div>
  );
}
