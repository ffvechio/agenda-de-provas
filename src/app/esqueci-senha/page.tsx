import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = { title: "Esqueci minha senha" };

export default function EsqueciSenhaPage() {
  return (
    <AuthShell
      titulo="Esqueci minha senha"
      descricao="Informe o e-mail da sua conta para receber um link de redefinição."
      rodape={
        <a href="/entrar" className="text-primary hover:underline">
          Voltar para o login
        </a>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
