import type { AnalyzedPhoto } from "./analyzeImage";
import type { ClientBrief, Insight } from "./types";

export function generateInsights(photos: AnalyzedPhoto[], brief: ClientBrief): Insight[] {
  if (!photos.length) return [];

  const averageScore = photos.reduce((acc, photo) => acc + photo.aiScore, 0) / photos.length;
  const topQuartile = photos.filter((photo) => photo.aiScore > 0.8).length;
  const orientationMatch = brief.orientation === "any"
    ? photos.length
    : photos.filter((photo) => photo.orientation === brief.orientation).length;

  const insights: Insight[] = [
    {
      severity: "info",
      title: "Gallery Health",
      description: `Average quality score sits at ${(averageScore * 100).toFixed(1)}%. ${topQuartile} frames are above 80%.`,
    },
  ];

  if (orientationMatch / photos.length < 0.35) {
    insights.push({
      severity: "warning",
      title: "Orientation Mismatch",
      description: `Only ${(orientationMatch / photos.length * 100).toFixed(0)}% of images match the requested ${brief.orientation} framing. Consider re-framing selections.`,
    });
  } else if (brief.orientation !== "any") {
    insights.push({
      severity: "success",
      title: "Orientation Coverage",
      description: `${(orientationMatch / photos.length * 100).toFixed(0)}% of the gallery aligns with the desired ${brief.orientation} aspect.`,
    });
  }

  const keywordHits = brief.moodKeywords.filter((keyword) =>
    photos.some((photo) => photo.tags.includes(keyword))
  );

  if (brief.moodKeywords.length && keywordHits.length === 0) {
    insights.push({
      severity: "warning",
      title: "Mood Gap",
      description: "AI tags did not find matches for the moods in the brief. Review lighting/color adjustments to bridge the gap.",
    });
  } else if (keywordHits.length) {
    insights.push({
      severity: "success",
      title: "Mood Coverage",
      description: `AI surfaced ${keywordHits.length} moods from the brief: ${keywordHits.join(", ")}.`,
    });
  }

  return insights;
}

export function buildHistogram(photos: AnalyzedPhoto[]): number[] {
  const buckets = new Array(12).fill(0);
  if (!photos.length) return buckets;

  for (const photo of photos) {
    const bucket = Math.min(11, Math.floor(photo.aiScore * 12));
    buckets[bucket]++;
  }

  const max = Math.max(...buckets, 1);
  return buckets.map((value) => (value / max) * 100);
}
