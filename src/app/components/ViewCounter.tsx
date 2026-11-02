"use client";

import { useEffect, useState } from "react";

export function formatViews(n: number) {
  if (n > 1000) return `${(n / 1000).toFixed(1)}k views`;
  return `${n} view${n > 1 ? "s" : ""}`;
}

// Footer page-view counter backed by /api/views.
export default function ViewCounter() {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/views", { method: "POST" })
      .then((r) => r.json())
      .then((d) => setViews(d.views));
  });

  if (views === null) return null;
  return <span>{formatViews(views)}</span>;
}
