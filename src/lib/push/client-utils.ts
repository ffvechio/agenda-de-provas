export function urlBase64ParaUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64Seguro = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const bruto = window.atob(base64Seguro);
  const saida = new Uint8Array(bruto.length);
  for (let i = 0; i < bruto.length; i++) {
    saida[i] = bruto.charCodeAt(i);
  }
  return saida;
}

export function pushSuportado(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}
