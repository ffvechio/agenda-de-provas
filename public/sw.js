// Service worker da Minha Agenda de Provas.
//
// Propositalmente simples: não há estratégia de cache para páginas ou
// chamadas de API (todo conteúdo autenticado é sempre buscado da rede —
// nunca guardamos respostas privadas em cache compartilhado). A única
// função de cache aqui é servir uma página estática de aviso quando a
// navegação falhar por falta de conexão. As outras responsabilidades são
// Web Push: exibir notificações recebidas e abrir a prova certa ao tocar.

const CACHE_ESTATICO = "shell-v1";
const ARQUIVOS_ESTATICOS = ["/offline.html", "/icons/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_ESTATICO).then((cache) => cache.addAll(ARQUIVOS_ESTATICOS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/offline.html"))
    );
  }
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    return;
  }

  const titulo = payload.title || "Minha Agenda de Provas";
  const opcoes = {
    body: payload.body || "",
    tag: payload.tag || "lembrete-prova",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: { url: payload.url || "/inicio" },
  };

  event.waitUntil(self.registration.showNotification(titulo, opcoes));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const destino = event.notification.data?.url || "/inicio";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((listaClientes) => {
        for (const cliente of listaClientes) {
          if (cliente.url.includes(destino) && "focus" in cliente) {
            return cliente.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(destino);
        }
      })
  );
});
