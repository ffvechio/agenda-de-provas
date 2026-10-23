import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { createClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = { title: "Redefinir senha" };

export default async function RedefinirSenhaPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return (
      <AuthShell
        titulo="Link inválido ou expirado"
        rodape={
          <a href="/entrar" className="text-primary hover:underline">
            Voltar para o login
          </a>
        }
      >
        <p className="text-sm text-muted-foreground">
          Este link de redefinição de senha não é mais válido. Solicite um
          novo link para continuar.
        </p>
        <a
          href="/esqueci-senha"
          className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
        >
          Solicitar novo link
        </a>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      titulo="Defina uma nova senha"
      descricao="Escolha uma nova senha para sua conta."
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
