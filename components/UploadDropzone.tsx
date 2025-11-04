"use client";

import { useCallback, useRef, useState } from "react";

interface UploadDropzoneProps {
  onFiles: (files: File[]) => void;
}

export function UploadDropzone({ onFiles }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const files = Array.from(fileList).filter((file) => file.type.startsWith("image/"));
      if (!files.length) return;
      onFiles(files);
    },
    [onFiles]
  );

  return (
    <section
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setIsDragging(false);
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        handleFiles(event.dataTransfer?.files ?? null);
      }}
      className={`flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-white/10 bg-surface/80 p-10 text-center transition ${
        isDragging ? "border-accent-500/70 bg-accent-500/10" : "hover:border-accent-500/40"
      }`}
    >
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-white">Drop your RAWs, JPEGs, or PNGs</h2>
        <p className="text-sm text-slate-400">
          We run AI scoring directly in your browser. Nothing is uploaded to a server.
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
        <span>Or</span>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-full border border-white/10 px-3 py-1 text-slate-300 transition hover:border-accent-400 hover:text-accent-100"
        >
          Browse files
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          handleFiles(event.target.files);
          if (event.target.value) event.target.value = "";
        }}
      />
      <ul className="w-full max-w-xl space-y-2 rounded-xl border border-white/5 bg-black/30 p-4 text-left text-xs text-slate-400">
        <li>- Automatic quality scoring combines sharpness, contrast, exposure, and dynamic range.</li>
        <li>- Intelligent tags surface moods such as moody and vibrant for instant filtering.</li>
        <li>- Shortlist the standouts, nominate a hero frame, and package finals for clients.</li>
      </ul>
    </section>
  );
}
