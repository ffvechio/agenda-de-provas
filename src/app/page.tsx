import Link from "next/link";
import { CalendarDays, Flag, History, Timer } from "lucide-react";
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
    <main className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center px-6 pt-20 pb-10 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Flag className="size-7" aria-hidden="true" />
        </div>

        <h1 className="mt-6 max-w-sm text-4xl leading-[1.1] font-bold tracking-tight text-balance text-foreground sm:max-w-xl sm:text-5xl">
          {titulo} <span className="text-primary">{destaque}</span>
        </h1>
        <p className="mt-4 max-w-sm text-base leading-relaxed text-muted-foreground sm:max-w-md sm:text-lg">
          {brand.descricaoApp}
        </p>

        <dl className="mt-9 flex w-full max-w-sm items-stretch justify-center divide-x divide-border border-y py-4 sm:max-w-md">
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

        <div className="mt-9 flex w-full max-w-sm flex-col divide-y divide-border text-left sm:max-w-2xl sm:flex-row sm:divide-x sm:divide-y-0">
          {RECURSOS.map((recurso) => (
            <div key={recurso.titulo} className="flex items-start gap-3 py-4 sm:flex-1 sm:flex-col sm:gap-2 sm:px-5 sm:py-0">
              <recurso.icone
                className="size-5 shrink-0 text-primary sm:size-6"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {recurso.titulo}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {recurso.descricao}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="h-12 w-full text-base sm:w-auto sm:px-8">
            <Link href="/cadastro">Criar conta</Link>
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
