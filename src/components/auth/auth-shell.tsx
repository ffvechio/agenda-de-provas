import Link from "next/link";
import { Flag } from "lucide-react";
import type { ReactNode } from "react";
import { brand } from "@/lib/config/brand";
import { Reveal } from "@/components/motion/reveal";

export function AuthShell({
  titulo,
  descricao,
  children,
  rodape,
}: {
  titulo: string;
  descricao?: string;
  children: ReactNode;
  rodape?: ReactNode;
}) {
  return (
    <main className="relative flex min-h-full flex-1 flex-col items-center justify-center overflow-hidden px-4 py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(ellipse_70%_60%_at_50%_-10%,color-mix(in_oklch,var(--primary)_20%,transparent),transparent)]"
      />
      <Reveal className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <Flag className="size-5" aria-hidden="true" />
          </div>
          <Link
            href="/"
            className="rounded-md text-base font-bold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {brand.nomeApp}
          </Link>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-foreground">{titulo}</h1>
          {descricao ? (
            <p className="mt-1 text-sm text-muted-foreground">{descricao}</p>
          ) : null}
          <div className="mt-6">{children}</div>
        </div>
        {rodape ? (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {rodape}
          </p>
        ) : null}
      </Reveal>
    </main>
  );
}
