"use client";

import type React from "react";
import { useRef } from "react";
import { CameraIcon, FileIcon, UploadIcon } from "./icons";

interface MenuUploadPanelProps {
  restaurantName: string;
  onRestaurantNameChange: (value: string) => void;
  onFileSelected: (file: File | null) => void;
  onSubmit: () => Promise<void> | void;
  isUploading?: boolean;
  status?: string | null;
  error?: string | null;
}

export function MenuUploadPanel({
  restaurantName,
  onRestaurantNameChange,
  onFileSelected,
  onSubmit,
  isUploading,
  status,
  error,
}: MenuUploadPanelProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 rounded-3xl bg-white/80 p-6 shadow-xl ring-1 ring-white/60">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#8b4049]">
          <UploadIcon className="h-6 w-6" />
          <p className="text-sm font-semibold uppercase tracking-[0.18em]">Menu upload</p>
        </div>
        <p className="text-sm text-[#5b5b5b]">Parse the list and create a session.</p>
      </div>

      {error ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      {status ? <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">{status}</p> : null}

      <label className="space-y-2 text-left text-sm text-[#4a4a4a]">
        Restaurant name (optional)
        <input
          type="text"
          className="w-full rounded-lg border border-[#d9c8bf] bg-white px-3 py-2 text-sm text-[#2c2c2c] focus:border-[#8b4049] focus:outline-none"
          placeholder="e.g. Bottega, Le Coucou"
          value={restaurantName}
          onChange={(event) => onRestaurantNameChange(event.target.value)}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <UploadTile
          title="Upload file"
          description="PDF or image of the wine list"
          icon={<FileIcon className="h-6 w-6" />}
          onClick={() => fileInputRef.current?.click()}
        />
        <UploadTile
          title="Take a photo"
          description="Use your camera to capture the list"
          icon={<CameraIcon className="h-6 w-6" />}
          onClick={() => fileInputRef.current?.click()}
        />
        <UploadTile
          title="From gallery"
          description="Select an existing image"
          icon={<UploadIcon className="h-6 w-6" />}
          onClick={() => fileInputRef.current?.click()}
        />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(event) => onFileSelected(event.target.files?.[0] ?? null)}
      />

      <button
        type="button"
        onClick={onSubmit}
        disabled={isUploading}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8b4049] to-[#6d323a] px-6 py-3 text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isUploading ? "Analyzing menu..." : "Analyze menu"}
      </button>
    </div>
  );
}

interface UploadTileProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

function UploadTile({ title, description, icon, onClick }: UploadTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-full flex-col items-start gap-2 rounded-2xl border border-[#e6dcd4] bg-white/70 p-4 text-left transition hover:-translate-y-0.5 hover:border-[#8b4049]/50"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8b4049]/10 text-[#8b4049]">{icon}</div>
      <p className="text-base font-semibold text-[#2c2c2c]">{title}</p>
      <p className="text-sm text-[#5b5b5b]">{description}</p>
    </button>
  );
}
