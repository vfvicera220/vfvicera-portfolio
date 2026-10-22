import type { Metadata } from "next";
import Portfolio from "../Portfolio";

// Upwork-safe version: work samples only, no contact form or contact links.
export const metadata: Metadata = {
  title: "Victor Francis Vicera — Work",
  robots: { index: false, follow: true },
};

export default function Work() {
  return <Portfolio contact={false} />;
}
