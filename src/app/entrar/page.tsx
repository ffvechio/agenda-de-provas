import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar" };

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; erro?: string; redefinida?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell
      titulo="Entrar"
      descricao="Acesse sua agenda de provas."
      rodape={
        <>
          Ainda não tem conta?{" "}
          <a href="/cadastro" className="text-primary hover:underline">
            Criar conta
          </a>
        </>
      }
    >
      <LoginForm
        redirectTo={params.redirect}
        erroLink={params.erro === "link-invalido"}
        senhaRedefinida={params.redefinida === "1"}
      />
    </AuthShell>
  );
}
