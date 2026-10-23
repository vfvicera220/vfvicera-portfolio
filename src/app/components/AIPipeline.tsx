"use client";

import { useEffect, useRef, useState } from "react";

// "How I build with AI" as a CI run: plan → delegate → steer → test →
// review ⟲ feedback → code review. Plays when scrolled into view; the review
// step loops back to steer until the output is right. Click a job to pin its log.

type Lead = "you" | "ai" | "shared";
type Job = { name: string; desc: string; you: number; lead: Lead; log: string[] };

const JOBS: Job[] = [
  { name: "plan", desc: "Scope, approach and acceptance criteria. Finalized before any code.", you: 90, lead: "you",
    log: ["define scope and constraints", "outline approach + edge cases", "write acceptance criteria", "✓ plan finalized → plan.md"] },
  { name: "delegate", desc: "Hand the finalized plan to AI to build.", you: 15, lead: "ai",
    log: ["hand plan.md to claude", "claude: reads the codebase for context", "claude: implements per plan", "✓ first build ready"] },
  { name: "steer", desc: "Course-correct mid-build when it drifts from the plan.", you: 50, lead: "shared",
    log: ["watch the build as it happens", "› nudge: follow existing patterns", "› nudge: keep scope to the plan", "✓ back on track"] },
  { name: "test", desc: "Run it locally; AI helps debug and write checks.", you: 40, lead: "shared",
    log: ["run it locally", "claude: helps reproduce + debug failures", "add / adjust checks", "✓ tests passing"] },
  { name: "review ⟲ feedback", desc: "Review the output and feed back until it is right.", you: 75, lead: "you",
    log: ["review output vs acceptance criteria", "✗ gaps found → feedback to claude", "↻ back to steer", "✓ desired output reached"] },
  { name: "code review", desc: "Final pass on the diff with AI before merge.", you: 50, lead: "shared",
    log: ["review the diff with claude", "flag risks, nits, missing tests", "address findings", "✓ ready to merge"] },
];
const REVIEW = 4;
const FINAL_ITER = 3;
// through review, loop back to steer twice, then finish
const SEQ: (number | "loop")[] = [0, 1, 2, 3, 4, "loop", 2, 3, 4, "loop", 2, 3, 4, 5];
const STEP_MS = 650;

type Status = "pending" | "running" | "done" | "failed";
type Run = { status: Status[]; running: number; iter: number; done: boolean; loopFlash: boolean };

const finished: Run = { status: JOBS.map(() => "done"), running: -1, iter: FINAL_ITER, done: true, loopFlash: false };

export default function AIPipeline({ accent }: { accent: string }) {
  const [run, setRun] = useState<Run>(finished);
  const [sel, setSel] = useState<number | null>(null);
  const timer = useRef<number>();
  const rootRef = useRef<HTMLDivElement>(null);
  const runRef = useRef(run);
  runRef.current = run;

  const start = () => {
    window.clearTimeout(timer.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRun(finished);
      return;
    }
    setSel(null);
    let r: Run = { status: JOBS.map(() => "pending"), running: -1, iter: 1, done: false, loopFlash: false };
    const commit = (next: Run) => {
      r = next;
      setRun(next);
    };
    commit(r);
    let i = 0;
    const step = () => {
      const ev = SEQ[i++];
      if (ev === undefined) {
        commit({ ...r, running: -1, done: true });
        return;
      }
      if (ev === "loop") {
        const status = r.status.slice();
        [2, 3, 4].forEach((k) => (status[k] = "pending"));
        commit({ ...r, status, running: -1, iter: r.iter + 1, loopFlash: true });
        timer.current = window.setTimeout(() => {
          commit({ ...r, loopFlash: false });
          step();
        }, STEP_MS);
        return;
      }
      const status = r.status.slice();
      status[ev] = "running";
      commit({ ...r, status, running: ev });
      timer.current = window.setTimeout(() => {
        const s2 = r.status.slice();
        s2[ev] = ev === REVIEW && r.iter < FINAL_ITER ? "failed" : "done";
        commit({ ...r, status: s2 });
        step();
      }, STEP_MS);
    };
    timer.current = window.setTimeout(step, 300);
  };

  // play once when the section scrolls into view
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          start();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const leadColor: Record<Lead, string> = { you: "var(--fg)", ai: accent, shared: "#9BC4A8" };
  const look: Record<Status, { icon: string; text: string; color: string }> = {
    pending: { icon: "○", text: "queued", color: "var(--muted-2)" },
    running: { icon: "●", text: "running…", color: accent },
    done: { icon: "✓", text: "passed", color: "#7DD3A8" },
    failed: { icon: "✗", text: "changes needed", color: "#F28B82" },
  };

  const shown = sel ?? (run.running >= 0 ? run.running : REVIEW);
  const job = JOBS[shown];
  const lines = job.log.slice();
  if (shown === REVIEW) lines[3] = run.done ? `✓ desired output reached on iteration ${run.iter}` : `↻ iteration ${run.iter}`;
  const st = run.status[shown];
  const visible = st === "pending" ? 0 : st === "running" ? 2 : lines.length;
  const lineColor = (t: string) =>
    t.startsWith("✓") ? "#7DD3A8" : t.startsWith("✗") ? "#F28B82" : t.startsWith("↻") || t.startsWith("›") ? accent : "var(--fg-2)";

  return (
    <div ref={rootRef} className="aip">
      {/* run header */}
      <div className="aip-head font-mono">
        <span style={{ color: run.done ? "#7DD3A8" : accent }}>
          ● {run.done ? "succeeded" : run.loopFlash ? "feedback → back to steer" : "running"}
        </span>
        <span style={{ color: "var(--fg-2)" }}>run #128 · ship-feature</span>
        <span style={{ color: "var(--muted-2)" }}>
          runs-on: <span style={{ color: accent }}>claude</span>
        </span>
        <span style={{ color: "var(--muted-2)" }}>
          iteration: <span style={{ color: "var(--fg)" }}>{run.iter}</span>
        </span>
        <button type="button" className="aip-rerun font-mono" onClick={start}>
          ↻ re-run
        </button>
      </div>

      {/* jobs */}
      <div className="aip-jobs-wrap">
        <div className={`aip-loop font-mono${run.loopFlash ? " flash" : ""}`} aria-hidden="true">
          <span className="aip-loop-label">{run.loopFlash ? `↻ iteration ${run.iter}` : "⟲ until it's right"}</span>
        </div>
        <div className="aip-jobs">
          {JOBS.map((j, k) => {
            const s = run.status[k];
            const l = look[s];
            const isRun = s === "running";
            const isSel = sel === k;
            return (
              <button
                key={j.name}
                type="button"
                className={`aip-job${isRun ? " running" : ""}${isSel ? " sel" : ""}${s === "pending" ? " pending" : ""}`}
                onClick={() => setSel(isSel ? null : k)}
                aria-pressed={isSel}
              >
                <span className="font-mono aip-job-top">
                  <span style={{ color: l.color }}>
                    {l.icon} {k + 1}
                  </span>
                  <span style={{ color: "var(--muted-2)" }}>{k === REVIEW && s === "done" && run.iter > 1 ? `×${run.iter}` : l.text}</span>
                </span>
                <span className="font-mono aip-job-name">{j.name}</span>
                <span className="aip-job-desc">{j.desc}</span>
                {k === REVIEW && <span className="font-mono aip-job-loopnote">⟲ loops back to steer</span>}
                <span className="aip-job-lead">
                  <span className="aip-bar" aria-hidden="true">
                    <span style={{ width: `${j.you}%`, background: "var(--fg)" }} />
                    <span style={{ width: `${100 - j.you}%`, background: accent }} />
                  </span>
                  <span className="font-mono" style={{ fontSize: 11, color: "var(--muted-2)" }}>
                    lead: <span style={{ color: leadColor[j.lead] }}>{j.lead}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* log */}
      <div className="aip-log font-mono">
        <div className="aip-log-side">
          <span style={{ color: "var(--muted-2)", fontSize: 11 }}>job log</span>
          <span style={{ color: accent }}>{job.name}</span>
          <span style={{ color: "var(--muted-2)", fontSize: 11 }}>{sel === null ? "following the run · click a job to pin" : "pinned · click again to unpin"}</span>
        </div>
        <div className="aip-log-body" aria-live="polite">
          {lines.slice(0, visible).map((t, i) => (
            <div key={i}>
              <span style={{ color: "var(--muted-2)" }}>{String(i + 1).padStart(2, "0")}</span>{"  "}
              <span style={{ color: lineColor(t) }}>{t}</span>
            </div>
          ))}
          {(!run.done || st === "running") && <span className="aip-caret" style={{ background: accent }} />}
        </div>
      </div>
    </div>
  );
}
