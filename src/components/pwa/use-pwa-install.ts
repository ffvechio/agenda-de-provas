"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function detectarStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const navegadorStandalone = (window.navigator as { standalone?: boolean }).standalone;
  return window.matchMedia("(display-mode: standalone)").matches || navegadorStandalone === true;
}

function detectarIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function usePwaInstall() {
  const [promptEvento, setPromptEvento] = useState<BeforeInstallPromptEvent | null>(null);
  const [instalado, setInstalado] = useState(false);
  const [ehIOS, setEhIOS] = useState(false);

  useEffect(() => {
    // Lido de forma assíncrona de propósito: APIs de navegador (matchMedia,
    // userAgent) não existem durante o SSR, então o estado inicial real só
    // pode ser determinado após a montagem no cliente.
    queueMicrotask(() => {
      setInstalado(detectarStandalone());
      setEhIOS(detectarIOS());
    });

    function aoPropor(event: Event) {
      event.preventDefault();
      setPromptEvento(event as BeforeInstallPromptEvent);
    }
    function aoInstalar() {
      setInstalado(true);
      setPromptEvento(null);
    }

    window.addEventListener("beforeinstallprompt", aoPropor);
    window.addEventListener("appinstalled", aoInstalar);
    return () => {
      window.removeEventListener("beforeinstallprompt", aoPropor);
      window.removeEventListener("appinstalled", aoInstalar);
    };
  }, []);

  async function instalar() {
    if (!promptEvento) return;
    await promptEvento.prompt();
    await promptEvento.userChoice;
    setPromptEvento(null);
  }

  return {
    instalado,
    ehIOS,
    podeInstalarDireto: Boolean(promptEvento),
    instalar,
  };
}
