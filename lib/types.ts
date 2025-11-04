import type { AnalyzedPhoto } from "./analyzeImage";

export interface ClientBrief {
  project: string;
  client: string;
  deliveryDate: string;
  moodKeywords: string[];
  mustInclude: string;
  notes: string;
  orientation: "any" | "landscape" | "portrait" | "square";
  subjectPriority: (typeof subjectOptions)[number][];
}

export const subjectOptions = [
  "People",
  "Details",
  "Wide Establishing",
  "Action",
  "Emotion",
  "Product",
] as const;

export interface DashboardState {
  photos: AnalyzedPhoto[];
  selectedIds: Set<string>;
  shortlistIds: Set<string>;
  heroId?: string;
}

export interface FilterOptions {
  orientation: "all" | "landscape" | "portrait" | "square";
  minScore: number;
  tags: string[];
  showShortlistOnly: boolean;
}

export type Insight = {
  title: string;
  description: string;
  severity: "info" | "warning" | "success";
};
