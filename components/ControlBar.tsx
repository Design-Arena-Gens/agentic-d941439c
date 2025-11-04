"use client";

import type { FilterOptions } from "@/lib/types";

interface ControlBarProps {
  filters: FilterOptions;
  onChange: (next: FilterOptions) => void;
  availableTags: string[];
  stats: {
    total: number;
    shortlisted: number;
    selected: number;
    hero: boolean;
  };
}

export function ControlBar({ filters, onChange, availableTags, stats }: ControlBarProps) {
  return (
    <section className="sticky top-4 z-20 flex flex-wrap gap-4 rounded-2xl border border-white/5 bg-surface/90 p-5 shadow-lg backdrop-blur">
      <div className="flex gap-4 text-sm text-slate-300">
        <Stat label="Imported" value={stats.total.toString()} />
        <Stat label="Shortlist" value={stats.shortlisted.toString()} highlight={stats.shortlisted > 0} />
        <Stat label="Selected" value={stats.selected.toString()} highlight={stats.selected > 0} />
        <Stat label="Hero" value={stats.hero ? "1" : "0"} highlight={stats.hero} />
      </div>

      <div className="flex flex-1 flex-wrap gap-4 text-xs uppercase text-slate-400">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Orientation</span>
          {(["all", "landscape", "portrait", "square"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onChange({ ...filters, orientation: option })}
              className={`rounded-full border px-3 py-1 transition ${
                filters.orientation === option
                  ? "border-accent-400/80 bg-accent-400/10 text-accent-100"
                  : "border-white/10 text-slate-400 hover:border-accent-400/40 hover:text-accent-100"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2">
            <span className="text-slate-500">Min Score</span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(filters.minScore * 100)}
              onChange={(event) => onChange({ ...filters, minScore: Number(event.target.value) / 100 })}
            />
            <span className="w-10 text-right text-slate-300">{Math.round(filters.minScore * 100)}</span>
          </label>
        </div>

        <div className="flex flex-1 flex-wrap items-center gap-2">
          <span className="text-slate-500">Tags</span>
          {availableTags.length === 0 && <span className="text-slate-600">None yet</span>}
          {availableTags.map((tag) => {
            const active = filters.tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  const nextTags = active
                    ? filters.tags.filter((current) => current !== tag)
                    : [...filters.tags, tag];
                  onChange({ ...filters, tags: nextTags });
                }}
                className={`rounded-full border px-3 py-1 transition ${
                  active
                    ? "border-emerald-400/70 bg-emerald-400/10 text-emerald-100"
                    : "border-white/10 text-slate-400 hover:border-emerald-400/40 hover:text-emerald-100"
                }`}
              >
                #{tag}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.showShortlistOnly}
              onChange={(event) => onChange({ ...filters, showShortlistOnly: event.target.checked })}
              className="h-4 w-4 rounded border border-white/20 bg-black/60 text-accent-400 focus:ring-0"
            />
            <span className="text-slate-500">Shortlist view</span>
          </label>
          <button
            type="button"
            onClick={() =>
              onChange({
                orientation: "all",
                minScore: 0.75,
                tags: [],
                showShortlistOnly: false,
              })
            }
            className="rounded-full border border-white/10 px-3 py-1 text-slate-400 transition hover:border-white/30 hover:text-white"
          >
            Reset
          </button>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-wide ${
        highlight
          ? "border-accent-400/60 bg-accent-400/10 text-accent-100"
          : "border-white/10 bg-black/30 text-slate-400"
      }`}
    >
      <div className="text-[10px] text-slate-500">{label}</div>
      <div className="text-base text-white">{value}</div>
    </div>
  );
}
