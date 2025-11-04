export type PhotoOrientation = "landscape" | "portrait" | "square";

export interface PhotoMetrics {
  brightness: number;
  contrast: number;
  saturation: number;
  sharpness: number;
  highlights: number;
  shadows: number;
  entropy: number;
}

export interface AnalyzedPhoto {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  orientation: PhotoOrientation;
  metrics: PhotoMetrics;
  aiScore: number;
  tags: string[];
  file: File;
  capturedAt?: string;
}

const sampleSize = 640;

function extractChannels(data: Uint8ClampedArray) {
  const channels = { r: [] as number[], g: [] as number[], b: [] as number[], luma: [] as number[] };
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    channels.r.push(r);
    channels.g.push(g);
    channels.b.push(b);
    channels.luma.push(luma);
  }
  return channels;
}

function mean(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function standardDeviation(values: number[], valueMean?: number) {
  const m = valueMean ?? mean(values);
  const variance = values.reduce((acc, value) => acc + Math.pow(value - m, 2), 0) / values.length;
  return Math.sqrt(variance);
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function computeSharpness(imageData: ImageData) {
  const { width, height, data } = imageData;
  const gray = new Float32Array(width * height);
  for (let i = 0, j = 0; i < data.length; i += 4, j += 1) {
    gray[j] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }

  const kernel = [0, -1, 0, -1, 4, -1, 0, -1, 0];
  let variance = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const conv =
        kernel[0] * gray[idx - width - 1] +
        kernel[1] * gray[idx - width] +
        kernel[2] * gray[idx - width + 1] +
        kernel[3] * gray[idx - 1] +
        kernel[4] * gray[idx] +
        kernel[5] * gray[idx + 1] +
        kernel[6] * gray[idx + width - 1] +
        kernel[7] * gray[idx + width] +
        kernel[8] * gray[idx + width + 1];
      variance += conv * conv;
    }
  }

  const normalised = variance / (width * height);
  return Math.sqrt(normalised) / 255;
}

function computeEntropy(luma: number[]) {
  const histogram = new Array(256).fill(0);
  for (const value of luma) {
    histogram[Math.round(value)]++;
  }

  const total = luma.length;
  let entropy = 0;
  for (const count of histogram) {
    if (count === 0) continue;
    const probability = count / total;
    entropy -= probability * Math.log2(probability);
  }
  return entropy / 8;
}

export async function analyzeImage(file: File): Promise<AnalyzedPhoto> {
  const id = crypto.randomUUID();
  const objectUrl = URL.createObjectURL(file);
  const bitmap = await createImageBitmap(file);
  const orientation: PhotoOrientation = bitmap.width === bitmap.height ? "square" : bitmap.width > bitmap.height ? "landscape" : "portrait";

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    throw new Error("Unable to access 2D context for analysis");
  }

  const scale = Math.min(1, sampleSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(bitmap, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);

  bitmap.close();

  const channels = extractChannels(imageData.data);
  const brightness = mean(channels.luma) / 255;
  const contrast = standardDeviation(channels.luma) / 128;
  const saturation =
    mean(channels.r.map((value, index) => {
      const max = Math.max(value, channels.g[index], channels.b[index]);
      const min = Math.min(value, channels.g[index], channels.b[index]);
      return max === 0 ? 0 : (max - min) / max;
    }));
  const sharpness = computeSharpness(imageData);
  const highlights = clamp01((channels.luma.filter((value) => value > 200).length / channels.luma.length) * 3);
  const shadows = clamp01((channels.luma.filter((value) => value < 40).length / channels.luma.length) * 3);
  const entropy = computeEntropy(channels.luma);

  const aiScore = clamp01(
    brightness * 0.25 +
      (1 - Math.abs(brightness - 0.6)) * 0.1 +
      contrast * 0.2 +
      saturation * 0.1 +
      sharpness * 0.25 +
      entropy * 0.1
  );

  const tags: string[] = [];
  if (sharpness > 0.12) tags.push("tack-sharp");
  if (saturation > 0.5) tags.push("vibrant");
  if (brightness < 0.3) tags.push("moody");
  if (brightness > 0.65) tags.push("airy");
  if (entropy > 0.6) tags.push("dynamic-range");
  if (contrast < 0.2) tags.push("soft");

  const metadata = await extractTimestamp(file);

  return {
    id,
    name: file.name,
    url: objectUrl,
    width: bitmap.width,
    height: bitmap.height,
    orientation,
    metrics: {
      brightness,
      contrast,
      saturation,
      sharpness,
      highlights,
      shadows,
      entropy,
    },
    aiScore,
    tags,
    file,
    capturedAt: metadata,
  };
}

async function extractTimestamp(file: File) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const view = new DataView(arrayBuffer);
    // Minimal EXIF search for DateTimeOriginal (0x9003)
    const stringDecoder = new TextDecoder("ascii");
    const str = stringDecoder.decode(arrayBuffer);
    const index = str.indexOf("DateTimeOriginal");
    if (index !== -1) {
      const match = str.slice(index - 20, index + 50).match(/(\d{4}:\d{2}:\d{2} \d{2}:\d{2}:\d{2})/);
      if (match) {
        return match[1].replace(/:/g, (value, idx) => (idx < 4 ? "-" : idx === 7 ? "-" : value));
      }
    }
  } catch (error) {
    console.warn("EXIF extraction failed", error);
  }
  return undefined;
}
