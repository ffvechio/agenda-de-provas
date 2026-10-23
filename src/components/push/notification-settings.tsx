"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pushSuportado, urlBase64ParaUint8Array } from "@/lib/push/client-utils";
import { rotuloDispositivo } from "@/lib/push/device-label";
import { desinscreverPush, inscreverPush } from "@/app/(app)/perfil/push-actions";

type Estado = "verificando" | "indisponivel" | "negado" | "inativo" | "ativo";

export function NotificationSettings() {
  const [estado, setEstado] = useState<Estado>("verificando");
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  useEffect(() => {
    async function verificar() {
      if (!pushSuportado()) {
        setEstado("indisponivel");
        return;
      }
      if (Notification.permission === "denied") {
        setEstado("negado");
        return;
      }
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setEstado(subscription ? "ativo" : "inativo");
      } catch {
        setEstado("indisponivel");
      }
    }
    verificar();
  }, []);

  async function ativar() {
    setMensagem(null);
    setCarregando(true);
    try {
      const permissao = await Notification.requestPermission();
      if (permissao !== "granted") {
        setEstado(permissao === "denied" ? "negado" : "inativo");
        return;
      }

      const chavePublica = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!chavePublica) {
        setMensagem("Notificações ainda não configuradas neste ambiente.");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ParaUint8Array(chavePublica) as BufferSource,
      });

      const json = subscription.toJSON();
      const resultado = await inscreverPush({
        endpoint: subscription.endpoint,
        p256dh: json.keys?.p256dh ?? "",
        authKey: json.keys?.auth ?? "",
        userAgent: navigator.userAgent,
        deviceLabel: rotuloDispositivo(navigator.userAgent),
      });

      if ("message" in resultado) {
        setMensagem(resultado.message);
        return;
      }
      setEstado("ativo");
    } catch {
      setMensagem("Não foi possível ativar as notificações agora.");
    } finally {
      setCarregando(false);
    }
  }

  async function desativar() {
    setMensagem(null);
    setCarregando(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await desinscreverPush(subscription.endpoint);
        await subscription.unsubscribe();
      }
      setEstado("inativo");
    } catch {
      setMensagem("Não foi possível desativar agora.");
    } finally {
      setCarregando(false);
    }
  }

  if (estado === "verificando") return null;

  if (estado === "indisponivel") {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <BellOff className="size-4" aria-hidden="true" />
        Notificações push não são suportadas neste navegador. Você pode
        continuar usando a agenda normalmente.
      </p>
    );
  }

  if (estado === "negado") {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <BellOff className="size-4" aria-hidden="true" />
        As notificações foram bloqueadas neste navegador. Para ativar,
        permita notificações para este site nas configurações do navegador.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {mensagem ? (
        <p role="alert" className="text-sm text-destructive">
          {mensagem}
        </p>
      ) : null}
      {estado === "ativo" ? (
        <>
          <p className="flex items-center gap-2 text-sm text-foreground">
            <BellRing className="size-4 text-primary" aria-hidden="true" />
            Notificações ativas neste dispositivo.
          </p>
          <Button variant="outline" className="h-10 self-start" disabled={carregando} onClick={desativar}>
            Desativar neste dispositivo
          </Button>
        </>
      ) : (
        <Button variant="outline" className="h-10 self-start" disabled={carregando} onClick={ativar}>
          <Bell className="size-4" aria-hidden="true" />
          Ativar notificações
        </Button>
      )}
    </div>
  );
}
