"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { TasteProfile } from "@/lib/tasteProfiles";
import { TasteProfileForm, type TasteProfileFormValues } from "../components/TasteProfileForm";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<TasteProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { data } = await supabaseBrowser.auth.getUser();
        if (!data?.user) {
          router.push("/login");
          return;
        }

        const res = await fetch("/api/taste-profiles");
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (res.ok) {
          const json = await res.json();
          if (!cancelled) {
            setProfile(json.profile ?? null);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load profile");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleSubmit = async (values: TasteProfileFormValues) => {
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/taste-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to save profile");
      }
      setProfile(json.profile);
      router.push("/menu");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f3ed] via-white to-[#f3e8e1] px-4 py-10 text-[#2c2c2c]">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-[#8b4049]">Onboarding</p>
          <h1 className="text-3xl font-serif text-[#2c2c2c]">Tell us how you like to drink</h1>
          <p className="text-[#5c5c5c]">We use this streamlined taste profile instead of the old persona sliders.</p>
        </div>

        {loading ? (
          <p className="text-center text-sm text-[#5b5b5b]">Loading...</p>
        ) : (
          <TasteProfileForm
            initialValues={profile ?? undefined}
            onSubmit={handleSubmit}
            isSaving={isSaving}
            error={error}
          />
        )}
      </div>
    </div>
  );
}
