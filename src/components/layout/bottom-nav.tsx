"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Home, Plus, UserRound } from "lucide-react";
import { cn } from "cn";

const ITENS = [
  { href: "/inicio", label: "Início", icone: Home },
  { href: "/provas", label: "Provas", icone: CalendarDays },
  { href: "/perfil", label: "Perfil", icone: UserRound },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-lg items-center justify-between px-6">
        {ITENS.slice(0, 1).map((item) => (
          <NavLink key={item.href} item={item} ativo={pathname.startsWith(item.href)} />
        ))}

        <Link
          href="/provas/novo"
          aria-label="Adicionar prova"
          className="-mt-6 flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-background transition-transform active:scale-95"
        >
          <Plus className="size-6" aria-hidden="true" />
        </Link>

        {ITENS.slice(1).map((item) => (
          <NavLink key={item.href} item={item} ativo={pathname.startsWith(item.href)} />
        ))}
      </div>
    </nav>
  );
}

function NavLink({
  item,
  ativo,
}: {
  item: (typeof ITENS)[number];
  ativo: boolean;
}) {
  const Icone = item.icone;
  return (
    <Link
      href={item.href}
      aria-current={ativo ? "page" : undefined}
      className={cn(
        "relative flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 px-2 py-2 text-xs font-medium transition-colors",
        ativo ? "text-primary" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icone className="size-5" aria-hidden="true" />
      {item.label}
      {ativo ? (
        <span
          aria-hidden="true"
          className="absolute top-0.5 size-1 rounded-full bg-primary"
        />
      ) : null}
    </Link>
  );
}
