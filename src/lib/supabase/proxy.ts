import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

const ROTAS_PUBLICAS_ANONIMAS = ["/entrar", "/cadastro"];
const PREFIXOS_PUBLICOS = [
  "/entrar",
  "/cadastro",
  "/privacidade",
  "/manifest.webmanifest",
  "/sw.js",
];

function ehRotaPublica(pathname: string): boolean {
  if (pathname === "/") return true;
  return PREFIXOS_PUBLICOS.some(
    (prefixo) => pathname === prefixo || pathname.startsWith(`${prefixo}/`)
  );
}

/**
 * Revalida a sessão a cada requisição (chamando getUser(), que valida o JWT
 * contra o Auth server — nunca confiar apenas em getSession() no servidor)
 * e faz os redirecionamentos otimistas de autenticação. Checagens de
 * autorização "de verdade" continuam acontecendo no servidor (RLS +
 * validação em cada Server Action/Route Handler), como recomenda o guia de
 * autenticação do Next.js.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const usuario = data.user;
  const { pathname } = request.nextUrl;

  if (!usuario && !ehRotaPublica(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/entrar";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (usuario && (pathname === "/" || ROTAS_PUBLICAS_ANONIMAS.includes(pathname))) {
    const url = request.nextUrl.clone();
    url.pathname = "/inicio";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
