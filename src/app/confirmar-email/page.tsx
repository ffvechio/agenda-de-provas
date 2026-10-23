import type { Metadata } from "next";
import { MailCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResendButton } from "./resend-button";

export const metadata: Metadata = { title: "Confirme seu e-mail" };

export default async function ConfirmarEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <AuthShell
      titulo="Confirme seu e-mail"
      rodape={
        <>
          Já confirmou?{" "}
          <a href="/entrar" className="text-primary hover:underline">
            Entrar
          </a>
        </>
      }
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <MailCheck className="size-7" aria-hidden="true" />
        </div>
        <p className="text-sm text-foreground">
          {email ? (
            <>
              Enviamos um link de confirmação para{" "}
              <strong className="font-semibold">{email}</strong>.
            </>
          ) : (
            "Enviamos um link de confirmação para o e-mail informado no cadastro."
          )}{" "}
          Clique no link para ativar sua conta.
        </p>
        <p className="text-sm text-muted-foreground">
          Se você já tem uma conta com este e-mail, nenhuma ação é
          necessária. Esqueceu sua senha?{" "}
          <a href="/esqueci-senha" className="text-primary hover:underline">
            Recupere o acesso
          </a>
          .
        </p>
        {email ? <ResendButton email={email} /> : null}
      </div>
    </AuthShell>
  );
}
