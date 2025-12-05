"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MenuUploadPanel } from "../components/MenuUploadPanel";
import type { MenuSession } from "@/lib/menuSessions";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export default function MenuPage() {
  const router = useRouter();
  const [restaurantName, setRestaurantName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [parsedListId, setParsedListId] = useState<string | null>(null);
  const [session, setSession] = useState<MenuSession | null>(null);

  useEffect(() => {
    supabaseBrowser.auth.getUser().then(({ data }) => {
      if (!data?.user) {
        router.push("/login");
      }
    });
  }, [router]);

  const handleUpload = async () => {
    if (!file) {
      setError("Upload a menu file or photo to continue.");
      return;
    }
    setIsUploading(true);
    setError(null);
    setStatus("Analyzing menu...");
      setParsedListId(null);
      setSession(null);

    const formData = new FormData();
    formData.append("file", file);
    if (restaurantName.trim()) {
      formData.append("restaurantName", restaurantName.trim());
    }

    try {
      const parseRes = await fetch("/api/parse-menu-image", { method: "POST", body: formData });
      const parseJson = await parseRes.json();
      if (!parseRes.ok) {
        throw new Error(parseJson.error || "Failed to parse menu");
      }

      const listId = parseJson.listId || parseJson.parsedListId;
      setParsedListId(listId ?? null);
      setStatus(parseJson.message || "Menu parsed. Creating session...");

      const sessionRes = await fetch("/api/menu-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant_name: restaurantName.trim() || null,
          parsed_list_id: listId ?? null,
          upload_reference: file.name,
          status: "parsed",
        }),
      });

      const sessionJson = await sessionRes.json();
      if (!sessionRes.ok) {
        throw new Error(sessionJson.error || "Failed to store session");
      }

      setSession(sessionJson.session);
      setStatus("Session saved. Ready for recommendations.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze menu");
    } finally {
      setIsUploading(false);
    }
  };

  const goToRecommendations = () => {
    if (!session?.id || !parsedListId) {
      setError("Parse a menu before continuing.");
      return;
    }
    const params = new URLSearchParams();
    params.set("sessionId", session.id);
    params.set("parsedListId", parsedListId);
    if (restaurantName) params.set("restaurant", restaurantName);
    router.push(`/recommendations?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f3ed] via-white to-[#f3e8e1] px-4 py-10 text-[#2c2c2c]">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-[#8b4049]">Menu</p>
          <h1 className="text-3xl font-serif text-[#2c2c2c]">Upload your wine list</h1>
          <p className="text-[#5c5c5c]">We store a menu session so recommendations stay tied to tonight's restaurant.</p>
        </div>

        <MenuUploadPanel
          restaurantName={restaurantName}
          onRestaurantNameChange={setRestaurantName}
          onFileSelected={setFile}
          onSubmit={handleUpload}
          isUploading={isUploading}
          status={status}
          error={error}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/70 p-4 text-sm text-[#5b5b5b]">
          <p>
            Parsed list id: <span className="font-semibold text-[#8b4049]">{parsedListId ?? "Not ready"}</span>
          </p>
          <button
            type="button"
            onClick={goToRecommendations}
            disabled={!parsedListId || !session}
            className="inline-flex items-center rounded-full bg-[#8b4049] px-4 py-2 text-white shadow disabled:cursor-not-allowed disabled:opacity-70"
          >
            View recommendations
          </button>
        </div>
      </div>
    </div>
  );
}
