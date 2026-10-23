import type { Metadata } from "next";
import { Download } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LogoutButton } from "@/components/auth/logout-button";
import { InstallPwaCard } from "@/components/pwa/install-pwa-card";
import { NotificationSettings } from "@/components/push/notification-settings";
import { PerfilForm } from "./perfil-form";
import { TrocarSenhaForm } from "./trocar-senha-form";
import { PreferenciasForm } from "./preferencias-form";
import { ExcluirContaDialog } from "./excluir-conta-dialog";

export const metadata: Metadata = { title: "Perfil" };

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: sessao } = await supabase.auth.getUser();
  const { data: perfil } = await supabase
    .from("profiles")
    .select("*")
    .maybeSingle();

  if (!sessao.user || !perfil) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8 pb-8">
      <h1 className="text-xl font-bold text-foreground">Perfil</h1>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Dados pessoais
        </h2>
        <PerfilForm
          valoresIniciais={{
            nome: perfil.nome,
            dataNascimento: perfil.data_nascimento,
          }}
        />
      </section>

      <Separator />

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground">E-mail</h2>
        <p className="text-sm text-foreground">{sessao.user.email}</p>
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Senha</h2>
        <TrocarSenhaForm />
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Aplicativo
        </h2>
        <InstallPwaCard />
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Notificações
        </h2>
        <PreferenciasForm
          fusoInicial={perfil.fuso_lembretes}
          notificacoesAtivasInicial={perfil.notificacoes_ativas}
        />
        <NotificationSettings />
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Seus dados
        </h2>
        <Button asChild variant="outline" className="h-11 w-full">
          <a href="/api/exportar-dados" download>
            <Download className="size-4" aria-hidden="true" />
            Exportar meus dados
          </a>
        </Button>
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <LogoutButton />
        <ExcluirContaDialog />
      </section>
    </div>
  );
}
