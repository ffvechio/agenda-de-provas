"use client";

import { useEffect } from "react";

/**
 * Registra o service worker silenciosamente (não exige permissão do
 * navegador, diferente de notificações push). Roda uma vez por carga do app.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Falha silenciosa: o app continua funcionando sem PWA/push.
    });
  }, []);

  return null;
}
