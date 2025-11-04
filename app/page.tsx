"use client";

import { useCallback, useMemo, useState } from "react";
import { analyzeImage, type AnalyzedPhoto } from "@/lib/analyzeImage";
import { buildHistogram, generateInsights } from "@/lib/insights";
import { BriefPanel } from "@/components/BriefPanel";
import { ControlBar } from "@/components/ControlBar";
import { InsightsPanel } from "@/components/InsightsPanel";
import { PhotoGrid } from "@/components/PhotoGrid";
import { UploadDropzone } from "@/components/UploadDropzone";
import type { ClientBrief, FilterOptions } from "@/lib/types";

const initialBrief: ClientBrief = {
  project: "Untitled Shoot",
  client: "",
  deliveryDate: "",
  moodKeywords: [],
  mustInclude: "",
  notes: "",
  orientation: "any",
  subjectPriority: [],
};

const initialFilters: FilterOptions = {
  orientation: "all",
  minScore: 0.75,
  tags: [],
  showShortlistOnly: false,
};

export default function DashboardPage() {
  const [photos, setPhotos] = useState<AnalyzedPhoto[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [shortlistIds, setShortlistIds] = useState<Set<string>>(new Set());
  const [heroId, setHeroId] = useState<string | undefined>();
  const [brief, setBrief] = useState<ClientBrief>(initialBrief);
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [processing, setProcessing] = useState<{ current: number; total: number } | null>(null);

  const availableTags = useMemo(() => Array.from(new Set(photos.flatMap((photo) => photo.tags))), [photos]);

  const filteredPhotos = useMemo(() => {
    return photos.filter((photo) => {
      if (filters.showShortlistOnly && !shortlistIds.has(photo.id)) return false;
      if (filters.orientation !== "all" && photo.orientation !== filters.orientation) return false;
      if (photo.aiScore < filters.minScore) return false;
      if (filters.tags.length && !filters.tags.every((tag) => photo.tags.includes(tag))) return false;
      return true;
    });
  }, [photos, filters, shortlistIds]);

  const insights = useMemo(() => generateInsights(photos, brief), [photos, brief]);
  const histogram = useMemo(() => buildHistogram(photos), [photos]);

  const handleFiles = useCallback(async (files: File[]) => {
    if (!files.length) return;
    setProcessing({ current: 0, total: files.length });
    const analyzed: AnalyzedPhoto[] = [];
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      try {
        const result = await analyzeImage(file);
        analyzed.push(result);
      } catch (error) {
        console.error("Failed to analyse", file.name, error);
      }
      setProcessing({ current: index + 1, total: files.length });
    }
    setProcessing(null);

    setPhotos((prev) => {
      const merged = [...prev, ...analyzed];
      return merged.sort((a, b) => b.aiScore - a.aiScore);
    });
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleShortlist = (id: string) => {
    setShortlistIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSetHero = (id: string) => setHeroId(id);

  const handleExport = useCallback(async () => {
    if (!selectedIds.size) return;
    const JSZip = (await import("jszip")).default;
    const { saveAs } = await import("file-saver");
    const zip = new JSZip();
    const deliveryFolder = zip.folder("final-selection");
    if (!deliveryFolder) {
      return;
    }

    const selectedPhotos = photos.filter((photo) => selectedIds.has(photo.id));
    for (const photo of selectedPhotos) {
      deliveryFolder.file(photo.name, photo.file);
    }

    const metadata = {
      project: brief.project,
      client: brief.client,
      deliveryDate: brief.deliveryDate,
      selected: selectedPhotos.map((photo) => ({
        file: photo.name,
        aiScore: photo.aiScore,
        tags: photo.tags,
        orientation: photo.orientation,
      })),
      hero: heroId,
      notes: brief.notes,
    };
    deliveryFolder.file("manifest.json", JSON.stringify(metadata, null, 2));

    const content = await zip.generateAsync({ type: "blob" });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    saveAs(content, `${brief.project || "selection"}-${stamp}.zip`);
  }, [selectedIds, photos, brief, heroId]);

  const stats = {
    total: photos.length,
    shortlisted: shortlistIds.size,
    selected: selectedIds.size,
    hero: Boolean(heroId),
  };

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 pb-16 pt-10">
      <header className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-accent-400">Photon Curator</p>
            <h1 className="mt-2 text-3xl font-semibold text-white md:text-4xl">Intelligent Photo Selection Workspace</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-400">
              Upload thousands of frames, let our on-device AI surface the sharpest, most on-brief moments, and deliver a polished shortlist your clients can approve instantly.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleExport}
              disabled={!selectedIds.size}
              className="rounded-xl border border-accent-400/60 bg-accent-500/20 px-5 py-3 text-sm font-semibold text-accent-100 shadow-lg transition enabled:hover:-translate-y-0.5 enabled:hover:bg-accent-500/30 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Export Selection
            </button>
            <button
              type="button"
              onClick={() => {
                setPhotos([]);
                setSelectedIds(new Set());
                setShortlistIds(new Set());
                setHeroId(undefined);
              }}
              className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-white/30 hover:text-white"
            >
              Reset Session
            </button>
          </div>
        </div>
      </header>

      <UploadDropzone onFiles={handleFiles} />
      {processing && <ProgressBanner current={processing.current} total={processing.total} />}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <ControlBar filters={filters} onChange={setFilters} availableTags={availableTags} stats={stats} />
          <PhotoGrid
            photos={filteredPhotos}
            selectedIds={selectedIds}
            shortlistIds={shortlistIds}
            heroId={heroId}
            onToggleSelect={toggleSelect}
            onToggleShortlist={toggleShortlist}
            onSetHero={handleSetHero}
          />
        </div>
        <div className="space-y-6">
          <BriefPanel value={brief} onChange={setBrief} />
          <InsightsPanel insights={insights} histogram={histogram} />
        </div>
      </div>
    </main>
  );
}

function ProgressBanner({ current, total }: { current: number; total: number }) {
  const percent = Math.round((current / total) * 100);
  return (
    <div className="flex items-center justify-between rounded-2xl border border-accent-500/40 bg-accent-500/10 p-4 text-sm text-accent-100 shadow-lg">
      <span>Analysing frames… {current} / {total}</span>
      <span className="text-xs uppercase tracking-wide">{percent}%</span>
    </div>
  );
}
