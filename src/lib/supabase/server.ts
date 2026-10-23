import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

/**
 * Cliente Supabase para Server Components, Server Actions e Route Handlers.
 * Lê/escreve a sessão via cookies da requisição atual.
 *
 * Em Server Components puros, `cookies().set()` lança um erro esperado do
 * Next.js (não é possível escrever cookies fora de Server Action/Route
 * Handler) — por isso o catch silencioso: o Proxy (src/proxy.ts) já cuida
 * de persistir o refresh do token a cada requisição.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Chamado de um Server Component — ignorado de propósito.
        }
      },
    },
  });
}
