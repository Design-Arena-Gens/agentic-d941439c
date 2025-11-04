"use client";

import type { Insight } from "@/lib/types";

interface InsightsPanelProps {
  insights: Insight[];
  histogram: number[];
}

export function InsightsPanel({ insights, histogram }: InsightsPanelProps) {
  return (
    <aside className="space-y-4">
      <section className="rounded-2xl border border-white/5 bg-surface/80 p-6 shadow-xl backdrop-blur">
        <header className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">AI Quality Curve</h2>
          <span className="text-xs uppercase tracking-wide text-slate-500">score spread</span>
        </header>
        <div className="mt-4 grid h-24 grid-cols-12 items-end gap-1">
          {histogram.map((value, index) => (
            <div key={index} className="relative h-full w-full">
              <div
                className="absolute bottom-0 inset-x-0 rounded-t bg-accent-500/60"
                style={{ height: `${value}%` }}
              />
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between text-xs text-slate-500">
          <span>Low</span>
          <span>High</span>
        </div>
      </section>

      <section className="space-y-3">
        {insights.map((insight) => (
          <InsightCard key={insight.title} {...insight} />
        ))}
        {insights.length === 0 && (
          <p className="rounded-2xl border border-white/5 bg-surface/80 p-6 text-sm text-slate-400">
            Import a gallery to see curation insights.
          </p>
        )}
      </section>
    </aside>
  );
}

function InsightCard({ title, description, severity }: Insight) {
  const palette = {
    info: "border-white/10 bg-white/5 text-slate-200",
    warning: "border-amber-400/40 bg-amber-400/10 text-amber-100",
    success: "border-emerald-400/50 bg-emerald-400/10 text-emerald-100",
  } as const;

  return (
    <article className={`rounded-2xl border p-5 text-sm shadow-lg backdrop-blur ${palette[severity]}`}>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 text-xs leading-relaxed opacity-80">{description}</p>
    </article>
  );
}
