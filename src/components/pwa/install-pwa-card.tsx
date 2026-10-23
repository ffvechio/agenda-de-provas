"use client";

import { Share, SquarePlus, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePwaInstall } from "./use-pwa-install";

export function InstallPwaCard() {
  const { instalado, ehIOS, podeInstalarDireto, instalar } = usePwaInstall();

  if (instalado) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Smartphone className="size-4" aria-hidden="true" />
        App já instalado neste dispositivo.
      </p>
    );
  }

  if (podeInstalarDireto) {
    return (
      <Button variant="outline" className="h-11 w-full" onClick={instalar}>
        <SquarePlus className="size-4" aria-hidden="true" />
        Adicionar à tela inicial
      </Button>
    );
  }

  if (ehIOS) {
    return (
      <div className="rounded-xl border p-3 text-sm text-muted-foreground">
        <p className="flex items-center gap-2 font-medium text-foreground">
          <Share className="size-4" aria-hidden="true" />
          Para instalar no iPhone:
        </p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Toque no ícone de compartilhar do Safari.</li>
          <li>Escolha &quot;Adicionar à Tela de Início&quot;.</li>
          <li>Confirme tocando em &quot;Adicionar&quot;.</li>
        </ol>
      </div>
    );
  }

  return (
    <p className="text-sm text-muted-foreground">
      Use o menu do seu navegador para instalar ou adicionar este app à tela
      inicial.
    </p>
  );
}
