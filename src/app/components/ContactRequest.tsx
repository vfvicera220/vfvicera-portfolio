"use client";

import { useRef, useState, type CSSProperties, type FormEvent } from "react";

// Contact details are request-only: visitors send a short request, which the
// Worker at /api/contact-request emails to Victor. He replies with whatever
// contact details he chooses to share.

type Status = "idle" | "sending" | "sent" | "error";

const field: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  background: "#16191c",
  border: "2px solid var(--line-2)",
  color: "var(--fg)",
  padding: "12px 14px",
  fontSize: 16,
  fontFamily: "var(--font-display)",
  borderRadius: 0,
  outline: "none",
};
const label: CSSProperties = { display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "var(--muted)" };

const WANTS = ["Email", "LinkedIn", "GitHub", "Upwork"] as const;

export default function ContactRequest({ accent }: { accent: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [wants, setWants] = useState<string[]>(["Email"]);
  const startedAt = useRef(Date.now());

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/contact-request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          reason: fd.get("reason"),
          wants,
          website: fd.get("website"), // honeypot
          elapsed: Date.now() - startedAt.current,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "sent") {
    return (
      <div className="font-mono" role="status" style={{ border: `2px solid ${accent}`, background: "#16191c", padding: "24px 28px", boxShadow: `4px 4px 0 ${accent}`, maxWidth: 720 }}>
        <div style={{ color: accent, fontSize: 13, marginBottom: 8 }}>request queued ✓</div>
        <p style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 20, color: "var(--fg)" }}>
          Thanks — I&apos;ll reply to your email with the contact details you asked for.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 720 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
        <label className="font-mono" style={label}>
          name
          <input name="name" required maxLength={100} autoComplete="name" style={field} />
        </label>
        <label className="font-mono" style={label}>
          your email
          <input name="email" type="email" required maxLength={200} autoComplete="email" style={field} />
        </label>
      </div>
      <label className="font-mono" style={label}>
        what&apos;s it about?
        <textarea name="reason" required minLength={10} maxLength={2000} rows={4} style={{ ...field, resize: "vertical" }} />
      </label>
      <fieldset className="font-mono" style={{ border: 0, padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        <legend style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10 }}>requesting access to</legend>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {WANTS.map((w) => {
            const on = wants.includes(w);
            return (
              <label
                key={w}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  minHeight: 44,
                  padding: "0 16px",
                  border: `2px solid ${on ? accent : "var(--line-2)"}`,
                  color: on ? accent : "var(--fg)",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => setWants((cur) => (on ? cur.filter((x) => x !== w) : [...cur, w]))}
                  style={{ accentColor: accent }}
                />
                {w}
              </label>
            );
          })}
        </div>
      </fieldset>
      {/* honeypot: hidden from people, bots fill it in */}
      <div aria-hidden="true" style={{ position: "absolute", left: -10000, width: 1, height: 1, overflow: "hidden" }}>
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 }}>
        <button
          type="submit"
          disabled={status === "sending" || wants.length === 0}
          style={{
            minHeight: 52,
            padding: "0 28px",
            border: "none",
            borderRadius: 999,
            background: accent,
            color: "#111315",
            fontWeight: 600,
            fontSize: 16,
            fontFamily: "var(--font-display)",
            cursor: status === "sending" ? "wait" : "pointer",
            opacity: status === "sending" || wants.length === 0 ? 0.6 : 1,
          }}
        >
          {status === "sending" ? "Sending…" : "Request contact"}
        </button>
        <span className="font-mono" style={{ fontSize: 12, color: "var(--muted-2)" }}>
          Details are shared by reply, not published.
        </span>
      </div>
      {status === "error" && (
        <p role="alert" className="font-mono" style={{ margin: 0, fontSize: 13, color: "#F28B82" }}>
          {error}
        </p>
      )}
    </form>
  );
}
