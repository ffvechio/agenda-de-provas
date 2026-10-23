import Link from "next/link";
import { CalendarDays, Flag, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/config/brand";

export default function LandingPage() {
  return (
    <main className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Flag className="size-8" aria-hidden="true" />
        </div>

        <h1 className="mt-6 max-w-sm text-3xl font-bold tracking-tight text-foreground">
          {brand.nomeApp}
        </h1>
        <p className="mt-3 max-w-sm text-base leading-relaxed text-muted-foreground">
          {brand.descricaoApp}
        </p>

        <div className="mt-8 grid w-full max-w-sm gap-3 text-left">
          <div className="flex items-center gap-3 rounded-xl border bg-card p-3">
            <CalendarDays className="size-5 shrink-0 text-primary" aria-hidden="true" />
            <span className="text-sm text-card-foreground">
              Provas confirmadas, de interesse e seu histórico em um só lugar
            </span>
          </div>
          <div className="flex items-center gap-3 rounded-xl border bg-card p-3">
            <Timer className="size-5 shrink-0 text-primary" aria-hidden="true" />
            <span className="text-sm text-card-foreground">
              Lembrete 5 dias antes de cada prova confirmada
            </span>
          </div>
        </div>

        <div className="mt-10 flex w-full max-w-sm flex-col gap-3">
          <Button asChild size="lg" className="h-12 text-base">
            <Link href="/cadastro">Criar conta</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 text-base">
            <Link href="/entrar">Entrar</Link>
          </Button>
        </div>
      </div>

      <footer className="pb-6 text-center text-xs text-muted-foreground">
        <Link href="/privacidade" className="hover:underline">
          Privacidade
        </Link>
      </footer>
    </main>
  );
}
