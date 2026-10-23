// Gera um novo par de chaves VAPID para Web Push.
// Uso: node scripts/generate-vapid-keys.mjs
// Cole a chave pública em NEXT_PUBLIC_VAPID_PUBLIC_KEY e a privada em
// VAPID_PRIVATE_KEY (.env.local para dev, secrets do host em produção).
// Gere um par diferente para cada ambiente (dev/preview/produção) e nunca
// reaproveite a chave privada de produção localmente.
import webpush from "web-push";

const { publicKey, privateKey } = webpush.generateVAPIDKeys();

console.log("NEXT_PUBLIC_VAPID_PUBLIC_KEY=" + publicKey);
console.log("VAPID_PRIVATE_KEY=" + privateKey);
