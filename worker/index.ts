// Cloudflare Worker: serves the static site and handles contact requests.
//   POST /api/contact-request  -> validates, rate-limits, emails the request
//   everything else            -> static assets from ./out
import { EmailMessage } from "cloudflare:email";

interface Env {
  ASSETS: { fetch(req: Request): Promise<Response> };
  EMAIL: { send(message: EmailMessage): Promise<void> };
  RATE_LIMIT?: { limit(opts: { key: string }): Promise<{ success: boolean }> };
  CONTACT_FROM: string; // sender on a domain with Email Routing, e.g. portfolio@kx-lab.org
  CONTACT_TO: string; // verified Email Routing destination
}

const WANTS = new Set(["Email", "LinkedIn", "GitHub", "Upwork"]);
const EMAIL_RE = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]{2,}$/;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

// no CR/LF in anything that ends up in a header
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();
const clip = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function encodeHeader(s: string) {
  // RFC 2047 encoded-word so non-ASCII names/subjects survive
  return /^[\x20-\x7e]*$/.test(s) ? s : `=?UTF-8?B?${btoa(String.fromCharCode(...new TextEncoder().encode(s)))}?=`;
}

// display names are always quoted (or encoded) so ":" "@" "," can't change header meaning
function displayName(s: string) {
  return /^[\x20-\x7e]*$/.test(s) ? `"${s.replace(/["\\]/g, "\\$&")}"` : encodeHeader(s);
}

function base64Body(s: string) {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/.{1,76}/g, "$&\r\n");
}

async function handleContact(req: Request, env: Env): Promise<Response> {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!(req.headers.get("content-type") || "").includes("application/json")) return json({ error: "Bad request" }, 400);

  const ip = req.headers.get("cf-connecting-ip") || "unknown";
  if (env.RATE_LIMIT) {
    const { success } = await env.RATE_LIMIT.limit({ key: ip });
    if (!success) return json({ error: "Too many requests. Please try again in a minute." }, 429);
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "Bad request" }, 400);
  }

  // bots: honeypot filled or submitted faster than a person could type
  if (clip(body.website, 200) || (typeof body.elapsed === "number" && body.elapsed < 2500)) {
    return json({ ok: true });
  }

  const name = oneLine(clip(body.name, 100));
  const email = oneLine(clip(body.email, 200));
  const reason = clip(body.reason, 2000);
  const wants = Array.isArray(body.wants) ? body.wants.filter((w): w is string => typeof w === "string" && WANTS.has(w)) : [];

  if (!name) return json({ error: "Please add your name." }, 400);
  if (!EMAIL_RE.test(email)) return json({ error: "Please enter a valid email address." }, 400);
  if (reason.length < 10) return json({ error: "Please tell me a bit more about what it's about." }, 400);
  if (!wants.length) return json({ error: "Pick at least one contact to request." }, 400);

  const subject = `Contact request: ${name} (${wants.join(", ")})`;
  const text = [
    `New contact request from vvicera.kx-lab.org`,
    ``,
    `Name:       ${name}`,
    `Email:      ${email}`,
    `Requesting: ${wants.join(", ")}`,
    `IP/Country: ${ip} / ${req.headers.get("cf-ipcountry") || "?"}`,
    ``,
    `Message:`,
    reason,
    ``,
    `-- Reply to this email to answer them directly.`,
  ].join("\n");

  const raw = [
    `From: ${displayName("Portfolio contact requests")} <${env.CONTACT_FROM}>`,
    `To: <${env.CONTACT_TO}>`,
    `Reply-To: ${displayName(name)} <${email}>`,
    `Subject: ${encodeHeader(subject)}`,
    `Message-ID: <${crypto.randomUUID()}@${env.CONTACT_FROM.split("@")[1]}>`,
    `Date: ${new Date().toUTCString()}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset=UTF-8`,
    `Content-Transfer-Encoding: base64`,
    ``,
    base64Body(text),
  ].join("\r\n");

  try {
    await env.EMAIL.send(new EmailMessage(env.CONTACT_FROM, env.CONTACT_TO, raw));
  } catch (err) {
    console.error("contact-request send failed", err);
    return json({ error: "Couldn't send right now. Please try again later." }, 502);
  }
  return json({ ok: true });
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === "/api/contact-request") return handleContact(req, env);
    return env.ASSETS.fetch(req);
  },
};
