import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Flag,
  History,
  Timer,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/config/brand";

const RECURSOS = [
  {
    icone: CalendarDays,
    titulo: "Tudo num só lugar",
    descricao: "Confirmadas, de interesse e seu histórico, organizados por data.",
  },
  {
    icone: Timer,
    titulo: "Lembrete automático",
    descricao: "Um aviso 5 dias antes de cada prova confirmada, direto no celular.",
  },
  {
    icone: History,
    titulo: "Histórico de verdade",
    descricao: "Registre o resultado de cada prova e acompanhe sua temporada.",
  },
] as const;

const INDICADORES = [
  { valor: "7", rotulo: "modalidades" },
  { valor: "D-5", rotulo: "lembrete automático" },
  { valor: "PWA", rotulo: "instalável no celular" },
] as const;

export default function LandingPage() {
  const palavras = brand.nomeApp.split(" ");
  const destaque = palavras.pop();
  const titulo = palavras.join(" ");

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden="true"
        className="bg-grid-tech bg-glow-primary pointer-events-none absolute inset-x-0 top-0 -z-10 h-[620px]"
      />

      <div className="flex flex-1 flex-col items-center justify-center px-6 pt-20 pb-10 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
          <Zap className="size-3.5 text-primary" aria-hidden="true" />
          Feito para quem vive de prova em prova
        </div>

        <div className="relative mt-7 flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_16px_32px_-12px_var(--primary)]">
          <Flag className="size-8" aria-hidden="true" />
        </div>

        <h1 className="mt-7 max-w-sm text-4xl leading-[1.08] font-bold tracking-tight text-balance text-foreground sm:max-w-xl sm:text-5xl lg:text-6xl">
          {titulo}{" "}
          <span className="bg-gradient-to-r from-primary to-stat bg-clip-text text-transparent">
            {destaque}
          </span>
        </h1>
        <p className="mt-4 max-w-sm text-base leading-relaxed text-muted-foreground sm:max-w-md sm:text-lg">
          {brand.descricaoApp}
        </p>

        <dl className="mt-8 flex w-full max-w-sm items-stretch justify-center divide-x divide-border rounded-2xl border bg-card/60 py-4 backdrop-blur-sm sm:max-w-md">
          {INDICADORES.map((item) => (
            <div key={item.rotulo} className="flex flex-1 flex-col px-2">
              <dt className="sr-only">{item.rotulo}</dt>
              <dd className="font-mono text-xl font-semibold text-foreground sm:text-2xl">
                {item.valor}
              </dd>
              <span className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                {item.rotulo}
              </span>
            </div>
          ))}
        </dl>

        <div className="mt-8 grid w-full max-w-sm gap-3 text-left sm:max-w-3xl sm:grid-cols-3">
          {RECURSOS.map((recurso) => (
            <div
              key={recurso.titulo}
              className="flex items-center gap-3 rounded-2xl border bg-card p-3.5 shadow-sm sm:flex-col sm:items-start sm:gap-2.5 sm:p-5"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <recurso.icone className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-card-foreground">
                  {recurso.titulo}
                </p>
                <p className="text-sm text-muted-foreground">{recurso.descricao}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
          <Button
            asChild
            size="lg"
            className="h-12 w-full text-base shadow-[0_12px_24px_-10px_var(--primary)] sm:w-auto sm:px-8"
          >
            <Link href="/cadastro">
              Criar conta
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 w-full text-base sm:w-auto sm:px-8"
          >
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
