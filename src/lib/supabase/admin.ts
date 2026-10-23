import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseUrl } from "./env";

/**
 * Cliente com a service role key — ignora RLS. Só pode ser importado por
 * código que roda exclusivamente no servidor (Route Handlers/Server
 * Actions de operações privilegiadas: exclusão de conta, Edge Functions).
 * NUNCA importar este módulo em um Client Component ou em código que possa
 * ser incluído no bundle do navegador.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY não configurada. Veja .env.example."
    );
  }

  return createSupabaseClient(getSupabaseUrl(), serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
