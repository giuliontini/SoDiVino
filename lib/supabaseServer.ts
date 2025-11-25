import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function createSupabaseServerClient() {
  const cookieStore = (await cookies()) as Awaited<ReturnType<typeof cookies>> & {
    set?: (name: string, value: string, options?: Record<string, unknown>) => void;
  };
  const setCookie = typeof cookieStore.set === "function" ? cookieStore.set.bind(cookieStore) : null;

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
    cookies: {
      getAll() {
        return cookieStore.getAll().map(({ name, value }) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        if (!setCookie) return;
        cookiesToSet.forEach(({ name, value, options }) => {
          setCookie(name, value, options);
        });
      },
    },
  });
}
