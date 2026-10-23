"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth/actions";
import { desinscreverPush } from "@/app/(app)/perfil/push-actions";

export function LogoutButton() {
  const [saindo, setSaindo] = useState(false);

  async function handleClick() {
    setSaindo(true);
    try {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        const subscription = await registration?.pushManager.getSubscription();
        if (subscription) {
          await desinscreverPush(subscription.endpoint);
          await subscription.unsubscribe();
        }
      }
    } catch {
      // Segue com o logout mesmo se a desinscrição falhar.
    } finally {
      await logout();
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="h-11 w-full"
      disabled={saindo}
      onClick={handleClick}
    >
      <LogOut className="size-4" aria-hidden="true" />
      {saindo ? "Saindo..." : "Sair da conta"}
    </Button>
  );
}
