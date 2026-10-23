import { TopHeader } from "@/components/layout/top-header";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopHeader />
      <div className="mx-auto w-full max-w-lg flex-1 px-4 pb-24 pt-4">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
