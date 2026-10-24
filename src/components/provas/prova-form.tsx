"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { provaSchema, type ProvaInput } from "@/lib/provas/schemas";
import {
  ehMultietapa,
  MODALIDADES,
  SITUACOES,
  UNIDADES_DISTANCIA,
} from "@/lib/provas/constantes";
import { provaFormPadrao } from "@/lib/provas/form-defaults";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DuplicidadeAviso } from "./duplicidade-aviso";

export function ProvaForm({
  valoresIniciais,
  provaId,
  aoSalvar,
}: {
  valoresIniciais?: ProvaInput;
  provaId?: string;
  aoSalvar: (input: ProvaInput) => Promise<{ message: string } | void>;
}) {
  const router = useRouter();
  const [mensagem, setMensagem] = useState<string | null>(null);

  const form = useForm<ProvaInput>({
    resolver: zodResolver(provaSchema),
    defaultValues: valoresIniciais ?? provaFormPadrao,
  });

  const etapasArray = useFieldArray({ control: form.control, name: "etapas" });
  const modalidade = form.watch("modalidade");
  const situacao = form.watch("situacao");
  const multietapa = ehMultietapa(modalidade);
  const nome = form.watch("nome");
  const data = form.watch("data");

  async function onSubmit(values: ProvaInput) {
    setMensagem(null);
    const resultado = await aoSalvar(values);
    if (resultado?.message) {
      setMensagem(resultado.message);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6 pb-10"
        noValidate
      >
        {mensagem ? (
          <p
            role="alert"
            className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {mensagem}
          </p>
        ) : null}

        <DuplicidadeAviso nome={nome} data={data} idExcluido={provaId} />

        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Informações básicas
          </h2>

          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da prova</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Ultra de Paraty" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="data"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="horarioLargada"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horário de largada</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="modalidade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modalidade</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione a modalidade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {MODALIDADES.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {modalidade === "outra" ? (
            <FormField
              control={form.control}
              name="modalidadeOutra"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Qual modalidade?</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Corrida de montanha" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-muted-foreground">
            {multietapa ? "Etapas" : "Distância"}
          </h2>

          {multietapa ? (
            <div className="flex flex-col gap-3">
              {etapasArray.fields.map((etapaField, index) => (
                <div key={etapaField.id} className="rounded-xl border p-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                      {index + 1}
                    </div>
                    <FormField
                      control={form.control}
                      name={`etapas.${index}.modalidade`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Natação, ciclismo..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      aria-label="Remover etapa"
                      onClick={() => etapasArray.remove(index)}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                  <div className="mt-2 grid grid-cols-[1fr_auto] gap-2 pl-9">
                    <FormField
                      control={form.control}
                      name={`etapas.${index}.distanciaValor`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.001"
                              inputMode="decimal"
                              placeholder="Distância"
                              {...field}
                              value={(field.value as number | string) ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`etapas.${index}.distanciaUnidade`}
                      render={({ field }) => (
                        <FormItem>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-20">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {UNIDADES_DISTANCIA.map((u) => (
                                <SelectItem key={u.value} value={u.value}>
                                  {u.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
              {form.formState.errors.etapas?.message ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.etapas.message}
                </p>
              ) : null}
              <Button
                type="button"
                variant="outline"
                className="self-start"
                onClick={() =>
                  etapasArray.append({
                    ordem: etapasArray.fields.length + 1,
                    modalidade: "",
                    distanciaValor: 0,
                    distanciaUnidade: "km",
                  })
                }
              >
                <Plus className="size-4" aria-hidden="true" />
                Adicionar etapa
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <FormField
                control={form.control}
                name="distanciaValor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Distância</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.001"
                        inputMode="decimal"
                        placeholder="Ex: 21.1"
                        {...field}
                        value={(field.value as number | string) ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="distanciaUnidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {UNIDADES_DISTANCIA.map((u) => (
                          <SelectItem key={u.value} value={u.value}>
                            {u.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
          )}
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-muted-foreground">Local</h2>
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="cidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado ou região</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="pais"
            render={({ field }) => (
              <FormItem>
                <FormLabel>País</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="local"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Local / endereço (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Praça Central" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Inscrição
          </h2>
          <FormField
            control={form.control}
            name="situacao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Situação</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SITUACOES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {situacao === "interesse" ? (
            <FormField
              control={form.control}
              name="notificarInteresse"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-xl border p-3">
                  <div>
                    <FormLabel>Notificar mesmo sendo interesse</FormLabel>
                    <FormDescription>
                      Envia o lembrete de 5 dias antes mesmo sem inscrição
                      confirmada.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          ) : null}
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Detalhes opcionais
          </h2>
          <FormField
            control={form.control}
            name="linkOficial"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link oficial</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="desnivelPositivoM"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Desnível positivo (m)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    {...field}
                    value={(field.value as number | string) ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="observacoes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Textarea rows={4} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <div className="sticky bottom-0 -mx-4 flex gap-3 border-t bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-11"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button type="submit" className="flex-1 h-11" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Salvando..." : "Salvar prova"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
