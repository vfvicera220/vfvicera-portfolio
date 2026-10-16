"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PALETTE, POSES, SPRITE_H, SPRITE_W, type Layer, type Pose } from "./catSprites";

// The cat runs along the tops of text lines in view, jumps between them,
// and stops to sit, face the viewer, groom or play with yarn.

const SCALE = 4;
const SW = SPRITE_W * SCALE; // 96
const FEET = SPRITE_H * SCALE; // 80
const LINES = ["meow.", "ship it.", "npm i catnip", "works on my machine", "scroll for the changelog", "hire my human →"];
const ACTS: [Pose, number][] = [["sit", 0.24], ["front", 0.2], ["groom", 0.17], ["yarn", 0.17]];

type Span = { a: number; b: number };
type Platform = { el: Element; left: number; right: number; top: number; feet: number; sp?: Span | null };
type Rect = { l: number; r: number; t: number; b: number };

type View = {
  x: number;
  y: number;
  hidden: boolean;
  flip: 1 | -1;
  rf: number; // 0..3 run frame, -1/-2 idle bob frames
  pf: number; // activity frame
  pose: Pose;
  bubble: string | null;
};

const rnd = (a: number, b: number) => a + Math.random() * Math.max(0, b - a);

function measure(el: Element): Platform | null {
  const range = document.createRange();
  range.selectNodeContents(el);
  const r = range.getClientRects()[0];
  if (!r || r.width < 70) return null;
  const fs = parseFloat(window.getComputedStyle(el).fontSize) || 16;
  return { el, left: r.left, right: r.right, top: r.top, feet: r.top + fs * 0.04 };
}

function textRects(): Rect[] {
  const out: Rect[] = [];
  const range = document.createRange();
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n: Node | null;
  while ((n = tw.nextNode())) {
    if (!n.nodeValue?.trim()) continue;
    const pe = n.parentElement;
    if (!pe || pe.closest(".mascot")) continue;
    range.selectNodeContents(n);
    for (const r of Array.from(range.getClientRects())) {
      if (r.width < 1 || r.bottom < 0 || r.top > window.innerHeight) continue;
      out.push({ l: r.left, r: r.right, t: r.top, b: r.bottom });
    }
  }
  return out;
}

// widest stretch of a line where the cat's whole body touches no other text
function freeSpan(pl: Platform, rects: Rect[]): Span | null {
  const a = Math.max(4, pl.left - 6);
  const b = Math.min(window.innerWidth - SW - 4, pl.right - SW + 6);
  if (b - a < 24) return null;
  const bandTop = pl.feet - FEET - 30;
  const bandBot = pl.top - 1;
  const blocked = rects
    .filter((r) => r.b > bandTop && r.t < bandBot)
    .map((r) => [r.l - SW - 8, r.r + 8] as const)
    .sort((x, y) => x[0] - y[0]);
  let best: Span | null = null;
  let cur = a;
  const consider = (s: number, e: number) => {
    if (e - s >= 24 && (!best || e - s > best.b - best.a)) best = { a: s, b: e };
  };
  for (const [s, e] of blocked) {
    if (e <= cur) continue;
    if (s > b) break;
    consider(cur, Math.min(s, b));
    cur = Math.max(cur, e);
  }
  consider(cur, b);
  return best;
}

function platforms(): Platform[] {
  const rects = textRects();
  const out: Platform[] = [];
  document.querySelectorAll("h1, h2, h3, p, .contact-mail").forEach((el) => {
    if (el.closest(".mascot")) return;
    const m = measure(el);
    if (!m || m.feet - FEET < 76 || m.feet > window.innerHeight - 8) return;
    m.sp = freeSpan(m, rects);
    if (m.sp) out.push(m);
  });
  return out;
}

// ---- rendering ----
function runs(rows: string[], keep: (c: string) => boolean, accent: string) {
  const out: JSX.Element[] = [];
  rows.forEach((r, y) => {
    let x = 0;
    while (x < r.length) {
      const c = r[x];
      if (c === "." || !keep(c)) {
        x++;
        continue;
      }
      let x2 = x;
      while (x2 + 1 < r.length && r[x2 + 1] === c) x2++;
      out.push(<rect key={`${x}-${y}`} x={x} y={y} width={x2 - x + 1} height={1} fill={PALETTE[c] ?? accent} />);
      x = x2 + 1;
    }
  });
  return out;
}

function layerVisible(layer: Layer, v: View): boolean {
  const run = v.rf >= 0;
  switch (layer.var) {
    case null:
    case "BALL":
    case "HEAD":
      return true;
    case "legIdle": return !run;
    case "leg0": return v.rf === 0;
    case "leg1": return v.rf === 1;
    case "leg2": return v.rf === 2;
    case "leg3": return v.rf === 3;
    case "flickA": return v.rf !== -2;
    case "flickB": return v.rf === -2;
    case "yarnUp": return v.pf === 0;
    case "yarnDown": return v.pf === 1;
    case "gTongue": return v.pf === 0;
    default: return true;
  }
}

function Sprite({ pose, v, accent }: { pose: Pose; v: View; accent: string }) {
  const layers = POSES[pose].layers;
  return (
    <svg
      width={SW}
      height={FEET}
      viewBox={`0 0 ${SPRITE_W} ${SPRITE_H}`}
      shapeRendering="crispEdges"
      style={{ display: "block" }}
    >
      {layers.map((layer) => {
        if (!layerVisible(layer, v)) return null;
        if (layer.var === null) {
          return (
            <g key={layer.name}>
              {runs(layer.rows, (c) => c !== "E" && c !== "Q", accent)}
              <g className="eyes">{runs(layer.rows, (c) => c === "E" || c === "Q", accent)}</g>
            </g>
          );
        }
        if (layer.var === "BALL") return <g key={layer.name} transform={`translate(${v.pf},0)`}>{runs(layer.rows, () => true, accent)}</g>;
        if (layer.var === "HEAD") return <g key={layer.name} transform={`translate(0,${v.pf})`}>{runs(layer.rows, () => true, accent)}</g>;
        return <g key={layer.name}>{runs(layer.rows, () => true, accent)}</g>;
      })}
    </svg>
  );
}

export default function CatMascot({ accent }: { accent: string }) {
  const [v, setV] = useState<View>({ x: -200, y: -200, hidden: true, flip: 1, rf: -1, pf: 0, pose: "stand", bubble: null });
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const s = {
      p: { x: -200, y: -200 },
      mode: "pause" as "pause" | "run" | "jump",
      act: "stand" as Pose,
      pauseStart: 0,
      pauseUntil: 0,
      tx: 0,
      plat: null as Platform | null,
      jump: null as null | { sx: number; sy: number; ex: number; ey: number; t0: number; dur: number; h: number; to: Platform },
      talk: false,
      li: -1,
      hidden: true,
      flip: 1 as 1 | -1,
      last: "",
    };
    const say = (chance: number) => {
      s.talk = Math.random() < chance;
      if (s.talk) s.li = (s.li + 1) % LINES.length;
    };
    const pause = (now: number, restChance: number) => {
      s.mode = "pause";
      s.pauseStart = now;
      let act: Pose = "stand";
      if (Math.random() < restChance) {
        const r = Math.random() * 0.78;
        let acc = 0;
        act = "sit";
        for (const [a, wgt] of ACTS) {
          acc += wgt;
          if (r < acc) {
            act = a;
            break;
          }
        }
      }
      s.act = act;
      s.pauseUntil = now + (act === "stand" ? 700 + Math.random() * 1000 : 2800 + Math.random() * 3400);
    };
    const place = () => {
      const pls = platforms();
      if (pls.length) {
        const pl = pls[Math.floor(Math.random() * pls.length)];
        s.plat = pl;
        s.p = { x: rnd(pl.sp!.a, pl.sp!.b), y: pl.feet - FEET };
      } else {
        s.plat = null;
        s.p = { x: rnd(16, window.innerWidth - SW - 16), y: window.innerHeight - FEET - 8 };
      }
      pause(Date.now(), 0.5);
    };
    const nextAction = () => {
      const pls = platforms();
      const others = pls
        .filter((q) => !s.plat || q.el !== s.plat.el)
        .filter((q) => Math.abs(q.feet - FEET - s.p.y) < 420);
      if (others.length && (!s.plat || Math.random() < 0.5)) {
        const to = others[Math.floor(Math.random() * others.length)];
        const ex = rnd(to.sp!.a, to.sp!.b);
        const ey = to.feet - FEET;
        const dist = Math.hypot(ex - s.p.x, ey - s.p.y);
        s.jump = { sx: s.p.x, sy: s.p.y, ex, ey, t0: Date.now(), dur: Math.min(900, 380 + dist * 0.6), h: 50 + Math.max(0, s.p.y - ey) * 0.5, to };
        s.mode = "jump";
        return;
      }
      const sp = s.plat?.sp ?? { a: 16, b: window.innerWidth - SW - 16 };
      let tx = rnd(sp.a, sp.b);
      if (Math.abs(tx - s.p.x) < 100) tx = s.p.x < (sp.a + sp.b) / 2 ? sp.b : sp.a;
      s.tx = tx;
      s.mode = "run";
    };

    let st = window.setTimeout(() => {
      place();
      say(1);
      s.hidden = false;
    }, 600);

    let raf = 0;
    const tick = () => {
      const now = Date.now();
      let walking = false;
      let airborne = false;
      let dir = 0;
      if (!s.hidden) {
        if (s.mode === "jump" && s.jump) {
          const j = s.jump;
          const t = Math.min(1, (now - j.t0) / j.dur);
          s.p.x = j.sx + (j.ex - j.sx) * t;
          s.p.y = j.sy + (j.ey - j.sy) * t - j.h * 4 * t * (1 - t);
          dir = j.ex - j.sx;
          airborne = true;
          if (t >= 1) {
            s.plat = j.to;
            pause(now, 0.5);
            say(0.4);
          }
        } else {
          if (s.plat) {
            const m = measure(s.plat.el);
            if (!m || m.feet - FEET < 60 || m.feet > window.innerHeight) place();
            else {
              m.sp = s.plat.sp;
              s.plat = m;
              s.p.y = m.feet - FEET;
            }
          }
          if (s.mode === "pause") {
            if (now >= s.pauseUntil && !reduced.current) nextAction();
          } else if (s.mode === "run") {
            const dx = s.tx - s.p.x;
            if (Math.abs(dx) > 3.5) {
              s.p.x += Math.sign(dx) * 3.4;
              walking = true;
              dir = dx;
            } else {
              pause(now, 0.7);
              say(0.5);
            }
          }
        }
      }
      const moving = walking || airborne;
      const pose: Pose = !moving && s.mode === "pause" && now - s.pauseStart > 350 ? s.act : "stand";
      const pf = Math.floor(now / 260) % 2;
      if (moving && Math.abs(dir) > 0.5) s.flip = dir < 0 ? -1 : 1;
      const rf = airborne ? 1 : walking ? Math.floor(now / 80) % 4 : -1 - (Math.floor(now / 550) % 2);
      const talkPose = pose === "stand" || pose === "sit" || pose === "front";
      const bubble = s.mode === "pause" && s.talk && talkPose ? LINES[Math.max(0, s.li)] : null;
      const next: View = { x: Math.round(s.p.x), y: Math.round(s.p.y), hidden: s.hidden, flip: s.flip, rf, pf, pose, bubble };
      const key = JSON.stringify(next);
      if (key !== s.last) {
        s.last = key;
        setV(next);
      }
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);

    const onScroll = () => {
      s.hidden = true;
      window.clearTimeout(st);
      st = window.setTimeout(() => {
        place();
        say(0.5);
        s.hidden = false;
      }, 280);
    };
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(st);
      window.removeEventListener("scroll", onScroll, { capture: true });
    };
  }, []);

  const run = v.rf >= 0;
  const bounceY = v.pose !== "stand" ? 0 : run ? (v.rf % 2 === 1 ? -4 : 0) : v.rf === -2 ? -3 : 0;
  const dustA = run && (v.rf === 0 || v.rf === 2);
  const dustB = run && (v.rf === 1 || v.rf === 3);
  const sprite = useMemo(() => <Sprite pose={v.pose} v={v} accent={accent} />, [v, accent]);

  return (
    <div
      aria-hidden="true"
      className="mascot"
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 50,
        pointerEvents: "none",
        transform: `translate(${v.x}px, ${v.y}px)`,
        willChange: "transform",
        opacity: v.hidden ? 0 : 1,
        transition: "opacity 0.18s steps(3)",
      }}
    >
      <div style={{ transform: `scale(${v.hidden ? 0.2 : 1})`, transformOrigin: "50% 100%", transition: "transform 0.3s cubic-bezier(.34,1.7,.5,1)" }}>
        {v.bubble && (
          <div
            className="font-mono mascot-bubble"
            style={{
              position: "absolute",
              bottom: 92,
              left: "50%",
              whiteSpace: "nowrap",
              background: "#E8E6E1",
              color: "#111315",
              fontSize: 11,
              lineHeight: 1,
              padding: "6px 8px",
              boxShadow: `3px 3px 0 ${accent}`,
            }}
          >
            {v.bubble}
          </div>
        )}
        <div style={{ position: "relative", transform: `scaleX(${v.flip})` }}>
          <div style={{ position: "absolute", left: -6, bottom: 2, width: 8, height: 8, background: "#3A3F44", opacity: dustA ? 1 : 0 }} />
          <div style={{ position: "absolute", left: -16, bottom: 6, width: 4, height: 4, background: "#3A3F44", opacity: dustB ? 1 : 0 }} />
          <div style={{ position: "relative", transform: `translateY(${bounceY}px)` }}>{sprite}</div>
        </div>
        <div style={{ width: 64, height: 4, margin: "2px auto 0", background: "rgba(0,0,0,0.5)" }} />
      </div>
    </div>
  );
}
