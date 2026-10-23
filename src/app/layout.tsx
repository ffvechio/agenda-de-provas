import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { brand } from "@/lib/config/brand";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: brand.nomeApp,
    template: `%s · ${brand.nomeCurto}`,
  },
  description: brand.descricaoApp,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: brand.nomeCurto,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: brand.corFundo,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang={brand.idiomaHtml}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster position="top-center" richColors closeButton />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
