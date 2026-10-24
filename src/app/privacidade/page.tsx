import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/lib/config/brand";

export const metadata: Metadata = { title: "Privacidade" };

export default function PrivacidadePage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10">
      <Link href="/" className="text-sm text-primary hover:underline">
        ← Voltar
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-foreground">
        Privacidade e dados — {brand.nomeApp}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Última atualização: preencher na publicação.
      </p>

      <div className="mt-6 space-y-6 text-sm leading-relaxed text-foreground">
        <section>
          <h2 className="font-semibold">Quem opera este serviço</h2>
          <p className="mt-1 text-muted-foreground">
            [PENDENTE: nome da pessoa ou empresa responsável, CNPJ/CPF se
            aplicável, e um e-mail de contato para assuntos de privacidade.
            Preencha estes dados antes de publicar o produto para usuários
            reais — este texto não deve ser inventado.]
          </p>
        </section>

        <section>
          <h2 className="font-semibold">O que coletamos</h2>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Nome e data de nascimento, informados no cadastro.</li>
            <li>E-mail e senha — a senha é gerenciada pelo Supabase Auth e
              nunca é armazenada em texto puro pela aplicação.</li>
            <li>Dados das provas que você cadastra (nome, data, local,
              modalidade, distância, observações e demais campos do
              formulário).</li>
            <li>Dados técnicos de notificações push (endpoint e chaves de
              criptografia do seu navegador/dispositivo), apenas se você
              ativar notificações.</li>
            <li>Dados técnicos de acesso (como IP e user-agent) processados
              pela infraestrutura de hospedagem para operação e segurança
              do serviço.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold">Para que usamos</h2>
          <p className="mt-1 text-muted-foreground">
            Para operar sua conta e sua agenda pessoal de provas, autenticar
            seu acesso, e enviar notificações push de lembrete 5 dias antes
            de provas confirmadas (quando ativadas). Não usamos
            seus dados para publicidade e não os vendemos a terceiros.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">Com quem compartilhamos</h2>
          <p className="mt-1 text-muted-foreground">
            Usamos o Supabase (banco de dados e autenticação) e um provedor
            de hospedagem (Vercel). Esses provedores processam dados em
            nosso nome como operadores técnicos de infraestrutura, não como
            terceiros com acesso independente aos seus dados.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">Seus direitos</h2>
          <p className="mt-1 text-muted-foreground">
            Você pode exportar seus dados e excluir sua conta a qualquer
            momento na tela de Perfil. A exclusão remove permanentemente seu
            perfil, suas provas e suas inscrições para notificações.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">Aviso legal</h2>
          <p className="mt-1 text-muted-foreground">
            Este texto descreve, em linguagem simples, como os dados são
            tratados nesta versão do produto. Ele não constitui aconselhamento
            jurídico nem afirma conformidade certificada com LGPD, GDPR ou
            qualquer outra legislação. Antes de operar com usuários reais,
            revise este conteúdo com um profissional jurídico qualificado.
          </p>
        </section>
      </div>
    </main>
  );
}
