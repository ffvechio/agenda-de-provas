import Link from "next/link";
import { brand } from "@/lib/config/brand";

export function TopHeader() {
  return (
    <header
      className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex h-14 max-w-lg items-center px-4">
        <Link href="/inicio" className="font-bold text-primary">
          {brand.nomeCurto}
        </Link>
      </div>
    </header>
  );
}
