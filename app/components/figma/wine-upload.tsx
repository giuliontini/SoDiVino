"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { Image as ImageIcon, Send, Camera } from "lucide-react";

interface WineUploadProps {
  personaName: string;
  restaurantName: string;
  onRestaurantChange: (value: string) => void;
  menuFile: File | null;
  onFileSelected: (file: File | null) => void;
  onUpload: () => Promise<void>;
  isUploading: boolean;
  statusMessage?: string | null;
  error?: string | null;
}

export function WineUpload({
  personaName,
  restaurantName,
  onRestaurantChange,
  menuFile,
  onFileSelected,
  onUpload,
  isUploading,
  statusMessage,
  error,
}: WineUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) onFileSelected(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const buttonDisabled = !menuFile || isUploading;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative min-h-screen overflow-hidden py-16 px-6">
      <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-[#f8f5f2]" />
      <div className="absolute -left-16 top-24 h-80 w-80 rounded-full bg-[#d4af37]/10 blur-3xl" />
      <div className="absolute -right-10 bottom-24 h-80 w-80 rounded-full bg-[#8b4049]/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-5xl space-y-8">
        <div className="rounded-3xl border border-white/80 bg-white/70 p-6 shadow-2xl backdrop-blur-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#8b4049]">Wine list</p>
              <h2 className="text-xl font-semibold text-[#2c2c2c]">Upload and analyze for {personaName}</h2>
              <p className="text-sm text-[#6b6b6b]">Drop a menu image and we will translate it into structured wines.</p>
            </div>
            {menuFile && <span className="rounded-full bg-[#d4af37]/10 px-4 py-2 text-xs font-semibold text-[#6b4a1f]">{menuFile.name}</span>}
          </div>

          {error && <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          {statusMessage && !error && <div className="mt-4 rounded-2xl border border-[#d4af37]/30 bg-[#d4af37]/10 px-4 py-3 text-sm text-[#6b4a1f]">{statusMessage}</div>}

          <div className="mt-5 grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-3">
              <label className="text-sm text-[#2c2c2c]">
                Restaurant (optional)
                <input
                  className="mt-2 w-full rounded-2xl border border-[#e4dcd2] bg-white px-4 py-3 text-sm shadow-inner focus:border-[#8b4049] focus:outline-none"
                  value={restaurantName}
                  onChange={(event) => onRestaurantChange(event.target.value)}
                  placeholder="e.g. Balthazar"
                />
              </label>
              <label
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 text-center transition ${
                  isDragging ? "border-[#8b4049]/80 bg-[#8b4049]/5" : "border-[#e4dcd2] bg-white"
                }`}
              >
                <input className="hidden" ref={fileInputRef} type="file" accept="image/*" onChange={(event) => onFileSelected(event.target.files?.[0] ?? null)} />
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#8b4049]/10 text-[#8b4049]">
                  <Camera className="h-6 w-6" />
                </div>
                <p className="mt-3 text-sm text-[#2c2c2c]">Drop your wine list photo here or click to browse.</p>
                <p className="text-xs text-[#6b6b6b]">We&apos;ll parse and summarize it for recommendations.</p>
                {menuFile && <p className="mt-2 text-xs text-[#6b6b6b]">Selected: {menuFile.name}</p>}
              </label>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-white/70 bg-white/70 p-4 shadow-lg backdrop-blur">
              <div className="flex items-center gap-3 rounded-2xl bg-[#8b4049]/10 px-4 py-3 text-[#8b4049]">
                <ImageIcon className="h-5 w-5" />
                <p className="text-sm">Upload a photo of the wine list. Clear, well-lit images work best.</p>
              </div>
              <div className="rounded-2xl bg-[#d4af37]/10 px-4 py-3 text-sm text-[#6b4a1f]">
                We&apos;ll map the parsed wines back to your chosen persona and preferences automatically.
              </div>
              <button
                type="button"
                disabled={buttonDisabled}
                onClick={onUpload}
                className="group relative flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8b4049] to-[#6d323a] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
                style={{ boxShadow: buttonDisabled ? "none" : "0 10px 40px rgba(139, 64, 73, 0.3)" }}
              >
                <motion.div className="absolute inset-0 bg-gradient-to-r from-[#d4af37] to-[#8b4049]" initial={{ x: "100%" }} whileHover={{ x: buttonDisabled ? "100%" : 0 }} transition={{ duration: 0.3 }} />
                {isUploading ? (
                  <span className="relative">Analyzing menu…</span>
                ) : (
                  <span className="relative flex items-center gap-2">
                    Start analysis
                    <Send className="h-4 w-4" />
                  </span>
                )}
              </button>
              <p className="text-xs text-[#6b6b6b]">Supported: JPG, PNG. Max 10MB.</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
