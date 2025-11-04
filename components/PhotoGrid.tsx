"use client";

import Image from "next/image";
import { useMemo } from "react";
import type { AnalyzedPhoto } from "@/lib/analyzeImage";

interface PhotoGridProps {
  photos: AnalyzedPhoto[];
  selectedIds: Set<string>;
  shortlistIds: Set<string>;
  heroId?: string;
  onToggleSelect: (id: string) => void;
  onToggleShortlist: (id: string) => void;
  onSetHero: (id: string) => void;
}

export function PhotoGrid({
  photos,
  selectedIds,
  shortlistIds,
  heroId,
  onToggleSelect,
  onToggleShortlist,
  onSetHero,
}: PhotoGridProps) {
  const sorted = useMemo(() => {
    return [...photos].sort((a, b) => b.aiScore - a.aiScore);
  }, [photos]);

  if (!photos.length) {
    return (
      <div className="grid h-full place-items-center rounded-2xl border border-dashed border-white/10 bg-surface/40 p-12 text-center text-sm text-slate-400">
        Drop RAWs or JPEGs to start scoring. No uploads leave your browser.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {sorted.map((photo, index) => {
        const selected = selectedIds.has(photo.id);
        const shortlisted = shortlistIds.has(photo.id);
        const isHero = heroId === photo.id;
        const tier = index < 12 ? "Keeper" : index < 36 ? "Consider" : "Archive";
        return (
          <article
            key={photo.id}
            className={`group relative overflow-hidden rounded-2xl border bg-surface/60 shadow-xl transition hover:-translate-y-1 hover:border-accent-500/40 hover:shadow-2xl ${
              isHero
                ? "border-accent-400/80"
                : shortlisted
                ? "border-emerald-400/60"
                : selected
                ? "border-white/40"
                : "border-white/5"
            }`}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
              <Image
                src={photo.url}
                alt={photo.name}
                fill
                unoptimized
                className={`object-cover transition duration-500 ${selected ? "scale-105" : "scale-100"}`}
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                priority={index < 6}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="absolute left-3 top-3 flex gap-2 text-xs font-medium">
                <span className="rounded-full bg-black/60 px-3 py-1 text-white/90 backdrop-blur">
                  {tier}
                </span>
                <span className="rounded-full bg-black/60 px-3 py-1 text-accent-200 backdrop-blur">
                  {(photo.aiScore * 100).toFixed(0)}%
                </span>
              </div>
              {isHero && (
                <span className="absolute right-3 top-3 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-black shadow-lg">
                  HERO
                </span>
              )}
            </div>

            <footer className="flex flex-col gap-4 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-white">{photo.name}</h3>
                  <p className="text-xs text-slate-500">
                    {photo.orientation} · {photo.width}×{photo.height}
                  </p>
                  {photo.capturedAt && <p className="text-xs text-slate-500">Captured {photo.capturedAt}</p>}
                </div>
                <div className="flex flex-col items-end gap-2 text-[10px] uppercase text-slate-500">
                  <span>Sharp {Math.round(photo.metrics.sharpness * 100)}</span>
                  <span>Contrast {Math.round(photo.metrics.contrast * 100)}</span>
                  <span>Entropy {Math.round(photo.metrics.entropy * 100)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {photo.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onToggleSelect(photo.id)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                    selected
                      ? "border-white/50 bg-white/10 text-white"
                      : "border-white/10 bg-transparent text-slate-300 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {selected ? "Selected" : "Select"}
                </button>
                <button
                  type="button"
                  onClick={() => onToggleShortlist(photo.id)}
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                    shortlisted
                      ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-100"
                      : "border-white/10 bg-transparent text-slate-300 hover:border-emerald-400/40 hover:text-emerald-100"
                  }`}
                >
                  {shortlisted ? "Shortlisted" : "Shortlist"}
                </button>
                <button
                  type="button"
                  onClick={() => onSetHero(photo.id)}
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                    isHero
                      ? "border-amber-400/80 bg-amber-400/20 text-amber-100"
                      : "border-white/10 bg-transparent text-slate-300 hover:border-amber-400/40 hover:text-amber-100"
                  }`}
                >
                  {isHero ? "Hero" : "Hero"}
                </button>
              </div>
            </footer>
          </article>
        );
      })}
    </div>
  );
}
