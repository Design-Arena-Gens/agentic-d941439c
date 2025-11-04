"use client";

import { useState } from "react";
import type { ClientBrief } from "@/lib/types";
import { subjectOptions } from "@/lib/types";

interface BriefPanelProps {
  value: ClientBrief;
  onChange: (next: ClientBrief) => void;
}

const keywordSuggestions = [
  "candid",
  "editorial",
  "cinematic",
  "warm",
  "high-contrast",
  "minimal",
  "documentary",
  "luxury",
  "natural-light",
  "flash",
];

export function BriefPanel({ value, onChange }: BriefPanelProps) {
  const [keywordInput, setKeywordInput] = useState("");

  const commitKeyword = (keyword: string) => {
    const trimmed = keyword.trim().toLowerCase();
    if (!trimmed) return;
    if (value.moodKeywords.includes(trimmed)) return;
    onChange({ ...value, moodKeywords: [...value.moodKeywords, trimmed] });
    setKeywordInput("");
  };

  const removeKeyword = (target: string) => {
    onChange({
      ...value,
      moodKeywords: value.moodKeywords.filter((keyword) => keyword !== target),
    });
  };

  return (
    <section className="rounded-2xl border border-white/5 bg-surface/80 p-6 shadow-xl backdrop-blur">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-white">Client Direction</h2>
          <p className="text-sm text-slate-400">Capture the creative intent so the cull aligns with the brief.</p>
        </div>
        <span className="rounded-full border border-accent-500/40 bg-accent-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-accent-200">
          context
        </span>
      </header>

      <div className="mt-6 grid gap-5 text-sm md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-slate-300">Project Name</span>
          <input
            className="rounded-lg border border-white/5 bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-accent-400/60 focus:ring-2 focus:ring-accent-500/40"
            placeholder="Editorial for Vogue"
            value={value.project}
            onChange={(event) => onChange({ ...value, project: event.target.value })}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-slate-300">Client</span>
          <input
            className="rounded-lg border border-white/5 bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-accent-400/60 focus:ring-2 focus:ring-accent-500/40"
            placeholder="Aurora Productions"
            value={value.client}
            onChange={(event) => onChange({ ...value, client: event.target.value })}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-slate-300">Delivery Deadline</span>
          <input
            type="date"
            className="rounded-lg border border-white/5 bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-accent-400/60 focus:ring-2 focus:ring-accent-500/40"
            value={value.deliveryDate}
            onChange={(event) => onChange({ ...value, deliveryDate: event.target.value })}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-slate-300">Must-Include Moments</span>
          <input
            className="rounded-lg border border-white/5 bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-accent-400/60 focus:ring-2 focus:ring-accent-500/40"
            placeholder="Bridal party candids, champagne tower" 
            value={value.mustInclude}
            onChange={(event) => onChange({ ...value, mustInclude: event.target.value })}
          />
        </label>
      </div>

      <div className="mt-6 space-y-4 text-sm">
        <div>
          <span className="mb-2 block text-slate-300">Priority Subjects</span>
          <div className="flex flex-wrap gap-2">
            {subjectOptions.map((option) => {
              const active = value.subjectPriority.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    const next = active
                      ? value.subjectPriority.filter((item) => item !== option)
                      : [...value.subjectPriority, option];
                    onChange({ ...value, subjectPriority: next });
                  }}
                  className={`rounded-full border px-3 py-1 text-xs uppercase tracking-wide transition ${
                    active
                      ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-100"
                      : "border-white/10 text-slate-400 hover:border-emerald-400/50 hover:text-emerald-100"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col gap-2">
            <span className="text-slate-300">Preferred Orientation</span>
            <div className="flex gap-2">
              {(["any", "landscape", "portrait", "square"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onChange({ ...value, orientation: option })}
                  className={`rounded-lg border px-3 py-1.5 text-xs uppercase tracking-wide transition ${
                    value.orientation === option
                      ? "border-accent-400/70 bg-accent-500/10 text-accent-200"
                      : "border-white/5 bg-black/40 text-slate-400 hover:border-accent-500/40 hover:text-white"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <span className="mb-2 block text-slate-300">Mood Keywords</span>
          <div className="flex flex-wrap gap-2">
            {value.moodKeywords.map((keyword) => (
              <button
                key={keyword}
                type="button"
                onClick={() => removeKeyword(keyword)}
                className="group flex items-center gap-1 rounded-full border border-accent-500/40 bg-accent-500/10 px-3 py-1 text-xs text-accent-100 transition hover:border-red-400/50 hover:bg-red-500/10 hover:text-red-200"
              >
                <span>#{keyword}</span>
                <span className="text-slate-400 group-hover:text-red-200">×</span>
              </button>
            ))}
            <input
              className="min-w-[160px] flex-1 rounded-full border border-dashed border-white/10 bg-transparent px-3 py-1 text-xs text-white outline-none placeholder:text-slate-500 focus:border-accent-400"
              placeholder="cinematic"
              value={keywordInput}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  commitKeyword(keywordInput);
                }
              }}
              onBlur={() => commitKeyword(keywordInput)}
              onChange={(event) => setKeywordInput(event.target.value)}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Tap a suggestion to add it to the brief.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {keywordSuggestions.map((keyword) => (
              <button
                key={keyword}
                type="button"
                onClick={() => commitKeyword(keyword)}
                className="rounded-full border border-white/5 px-3 py-1 text-xs text-slate-400 transition hover:border-accent-500/40 hover:bg-accent-500/10 hover:text-accent-100"
              >
                #{keyword}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="mb-2 block text-slate-300">Notes for Retoucher</span>
          <textarea
            rows={3}
            className="w-full rounded-xl border border-white/5 bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-accent-400/60 focus:ring-2 focus:ring-accent-500/40"
            placeholder="Skin tone preferences, retouching intensity, no liquify, keep grain intact."
            value={value.notes}
            onChange={(event) => onChange({ ...value, notes: event.target.value })}
          />
        </label>
      </div>
    </section>
  );
}
