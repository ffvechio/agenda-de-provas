import Link from "next/link";
import { Flag } from "lucide-react";
import { brand } from "@/lib/config/brand";

export function TopHeader() {
  return (
    <header
      className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex h-14 max-w-lg items-center gap-2 px-4">
        <Link
          href="/inicio"
          className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Flag className="size-4" aria-hidden="true" />
          </span>
          <span className="font-bold tracking-tight text-foreground">
            {brand.nomeCurto}
          </span>
        </Link>
      </div>
    </header>
  );
}
