import type { MetadataRoute } from "next";
import { brand } from "@/lib/config/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: brand.nomeApp,
    short_name: brand.nomeCurto,
    description: brand.descricaoApp,
    start_url: "/inicio",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: brand.corFundo,
    theme_color: brand.corFundo,
    lang: "pt-BR",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
