import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Destinos permitidos após verificar o link de e-mail — nunca redirecionar
// para uma URL arbitrária vinda da querystring (evita open redirect).
const DESTINOS_PERMITIDOS = new Set(["/inicio", "/redefinir-senha"]);
const TIPOS_SUPORTADOS = new Set(["signup", "recovery"]);

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const destinoSolicitado = searchParams.get("next") ?? "/inicio";
  const next = DESTINOS_PERMITIDOS.has(destinoSolicitado)
    ? destinoSolicitado
    : "/inicio";

  if (tokenHash && type && TIPOS_SUPORTADOS.has(type)) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type: type as "signup" | "recovery",
      token_hash: tokenHash,
    });

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/entrar?erro=link-invalido`);
}
