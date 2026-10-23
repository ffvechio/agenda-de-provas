import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "Criar conta" };

export default function CadastroPage() {
  return (
    <AuthShell
      titulo="Criar conta"
      descricao="Organize suas provas em poucos minutos."
      rodape={
        <>
          Já tem conta?{" "}
          <a href="/entrar" className="text-primary hover:underline">
            Entrar
          </a>
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
