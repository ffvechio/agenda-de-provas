"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { reenviarConfirmacao } from "./actions";

const COOLDOWN_SEGUNDOS = 60;

export function ResendButton({ email }: { email: string }) {
  const [segundosRestantes, setSegundosRestantes] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function iniciarCooldown() {
    setSegundosRestantes(COOLDOWN_SEGUNDOS);
    intervalRef.current = setInterval(() => {
      setSegundosRestantes((atual) => {
        if (atual <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return atual - 1;
      });
    }, 1000);
  }

  async function handleClick() {
    setEnviando(true);
    try {
      await reenviarConfirmacao(email);
      setEnviado(true);
      iniciarCooldown();
    } finally {
      setEnviando(false);
    }
  }

  const desabilitado = enviando || segundosRestantes > 0;

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        type="button"
        variant="outline"
        className="h-11"
        disabled={desabilitado}
        onClick={handleClick}
      >
        {segundosRestantes > 0
          ? `Reenviar em ${segundosRestantes}s`
          : enviando
            ? "Enviando..."
            : "Reenviar e-mail de confirmação"}
      </Button>
      {enviado && segundosRestantes > 0 ? (
        <p className="text-sm text-muted-foreground" role="status">
          E-mail reenviado. Verifique sua caixa de entrada.
        </p>
      ) : null}
    </div>
  );
}
