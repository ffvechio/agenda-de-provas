import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// No Next.js 16, Middleware foi renomeado para Proxy (mesmo comportamento).
export function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons/|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)",
  ],
};
