export function rotuloDispositivo(userAgent: string): string {
  const ehIOS = /iphone|ipad|ipod/i.test(userAgent);
  const ehAndroid = /android/i.test(userAgent);
  const navegador = /edg\//i.test(userAgent)
    ? "Edge"
    : /chrome|crios/i.test(userAgent)
      ? "Chrome"
      : /firefox|fxios/i.test(userAgent)
        ? "Firefox"
        : /safari/i.test(userAgent)
          ? "Safari"
          : "Navegador";
  const plataforma = ehIOS ? "iPhone/iPad" : ehAndroid ? "Android" : "Computador";
  return `${navegador} · ${plataforma}`;
}
