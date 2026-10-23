import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

/**
 * Cliente Supabase para uso em Client Components. Mantém a sessão em
 * cookies (via @supabase/ssr) para que o servidor também consiga lê-la.
 */
export function createClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey());
}
