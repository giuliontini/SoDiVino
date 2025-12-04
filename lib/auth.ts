import { createSupabaseServerClient } from "./supabaseServer";

export async function createSupabaseServerAuthClient() {
  return createSupabaseServerClient();
}

export async function getUserId(): Promise<string> {
  const supabase = await createSupabaseServerAuthClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    throw new Error("UNAUTHENTICATED");
  }

  return data.user.id;
}
