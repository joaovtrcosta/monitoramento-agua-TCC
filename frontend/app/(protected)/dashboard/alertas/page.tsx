"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Droplets,
  Info,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Waves,
} from "lucide-react";

type Medicao = {
  medicaoId: string;
  dataHora: string;
  vazao: number;
  volumeLitros: number;
};

type AnaliseVazamento = {
  quantidade_leituras_analisadas?: number;
  possivel_vazamento: boolean;
  status: string;
  alerta: string;
  tipo_analise?: string;
  parametros?: {
    limiar_vazao_litros_minuto: number;
    duracao_minima_segundos: number;
    intervalo_maximo_entre_leituras_segundos: number;
  };
  sequencia_analisada?: {
    quantidade_leituras: number;
    inicio: string;
    fim: string;
    duracao_segundos: number;
    vazao_media_litros_minuto: number;
  };
  observacao?: string;
};

const API = "http://localhost:8080/api/medicoes";

function formatarNumero(valor: number | undefined) {
  if (valor === undefined || valor === null) return "—";

  return Number(valor).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatarDataHora(data: string | undefined) {
  if (!data) return "—";

  const convertida = new Date(data);

  if (Number.isNaN(convertida.getTime())) {
    return data;
  }

  return convertida.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatarDuracao(segundos: number | undefined) {
  if (segundos === undefined || segundos === null) {
    return "—";
  }

  if (segundos < 60) {
    return `${formatarNumero(segundos)} segundos`;
  }

  const minutos = Math.floor(segundos / 60);
  const segundosRestantes = Math.round(segundos % 60);

  if (minutos < 60) {
    return `${minutos} min ${segundosRestantes} s`;
  }

  const horas = Math.floor(minutos / 60);
  const minutosRestantes = minutos % 60;

  return `${horas} h ${minutosRestantes} min`;
}

export default function AlertasPage() {
  const router = useRouter();

  const [analise, setAnalise] = useState<AnaliseVazamento | null>(null);

  const [carregando, setCarregando] = useState(false);
  const [verificando, setVerificando] = useState(true);

  const [semMedicoes, setSemMedicoes] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const verificarMedicoes = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    setVerificando(true);
    setErro(null);

    try {
      const resposta = await fetch(API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (resposta.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!resposta.ok) {
        throw new Error("Não foi possível consultar as medições.");
      }

      const medicoes: Medicao[] = await resposta.json();

      setSemMedicoes(!Array.isArray(medicoes) || medicoes.length === 0);
    } catch (error) {
      console.error("Erro ao verificar medições:", error);

      setErro("Não foi possível verificar as medições disponíveis.");
    } finally {
      setVerificando(false);
    }
  }, [router]);

  useEffect(() => {
    void verificarMedicoes();
  }, [verificarMedicoes]);

  async function executarAnalise() {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    setCarregando(true);
    setErro(null);
    setAnalise(null);

    try {
      const respostaMedicoes = await fetch(API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (respostaMedicoes.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!respostaMedicoes.ok) {
        throw new Error("Não foi possível consultar as medições.");
      }

      const medicoes: Medicao[] = await respostaMedicoes.json();

      if (!Array.isArray(medicoes) || medicoes.length === 0) {
        setSemMedicoes(true);
        return;
      }

      setSemMedicoes(false);

      const resposta = await fetch(`${API}/analisar-vazamento`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (resposta.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!resposta.ok) {
        const mensagem = await resposta.text().catch(() => "");

        console.error("Erro na análise de vazamentos:", mensagem);

        throw new Error("Não foi possível realizar a análise de vazamentos.");
      }

      const resultado: AnaliseVazamento = await resposta.json();

      setAnalise(resultado);
    } catch (error) {
      console.error("Erro ao analisar vazamentos:", error);

      setErro(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro durante a análise.",
      );
    } finally {
      setCarregando(false);
    }
  }

  const painel =
    "rounded-2xl border border-blue-400/10 bg-blue-950/20 p-5 sm:p-6";

  const card = "rounded-2xl border border-blue-400/10 bg-blue-950/20 p-5";

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
            Segurança e monitoramento
          </p>

          <h1 className="text-3xl font-bold">Alertas e vazamentos</h1>

          <p className="mt-2 text-sm text-slate-400">
            Identifique padrões de fluxo que podem indicar possíveis vazamentos
            de água.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void executarAnalise()}
          disabled={carregando || verificando || semMedicoes || Boolean(erro)}
          className="flex w-fit items-center gap-2 rounded-xl border border-blue-400/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-300 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${carregando ? "animate-spin" : ""}`}
          />

          {carregando ? "Analisando..." : "Verificar vazamentos"}
        </button>
      </section>

      {erro && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-5">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />

          <div>
            <p className="font-medium text-red-300">
              Erro ao verificar vazamentos
            </p>

            <p className="mt-2 text-sm text-slate-400">{erro}</p>

            <button
              type="button"
              onClick={() => void verificarMedicoes()}
              className="mt-3 text-sm font-medium text-blue-400 hover:text-blue-300"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )}

      {verificando && (
        <div className={`${painel} py-14 text-center`}>
          <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-400" />

          <p className="text-sm text-slate-400">
            Verificando medições disponíveis...
          </p>
        </div>
      )}

      {!verificando && semMedicoes && !erro && (
        <div className={`${painel} py-14 text-center`}>
          <Droplets className="mx-auto mb-4 h-10 w-10 text-blue-400" />

          <h2 className="text-lg font-semibold">Nenhuma medição disponível</h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
            Ainda não existem registros de consumo suficientes para iniciar a
            verificação de possíveis vazamentos.
          </p>

          <button
            type="button"
            onClick={() => void verificarMedicoes()}
            className="mt-5 rounded-xl border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-300 hover:bg-blue-500/20"
          >
            Atualizar medições
          </button>
        </div>
      )}

      {!verificando && !semMedicoes && !carregando && !analise && !erro && (
        <section className={`${painel} py-12 text-center`}>
          <ShieldCheck className="mx-auto mb-5 h-12 w-12 text-blue-400" />

          <h2 className="text-xl font-semibold">Análise de vazamentos</h2>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-400">
            Clique em &quot;Verificar vazamentos&quot; para analisar as medições
            disponíveis e identificar possíveis padrões de fluxo contínuo.
          </p>
        </section>
      )}

      {carregando && (
        <div className={`${painel} py-14 text-center`}>
          <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-400" />

          <h2 className="font-semibold">Analisando possíveis vazamentos...</h2>

          <p className="mt-2 text-sm text-slate-400">
            O sistema está verificando as sequências de vazão registradas.
          </p>
        </div>
      )}

      {!carregando && analise && (
        <>
          <section
            className={`rounded-2xl border p-6 ${
              analise.possivel_vazamento
                ? "border-red-500/20 bg-red-500/5"
                : "border-emerald-500/20 bg-emerald-500/5"
            }`}
          >
            <div className="flex items-start gap-4">
              {analise.possivel_vazamento ? (
                <ShieldAlert className="h-9 w-9 shrink-0 text-red-400" />
              ) : (
                <ShieldCheck className="h-9 w-9 shrink-0 text-emerald-400" />
              )}

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Resultado da análise
                </p>

                <h2
                  className={`text-xl font-bold ${
                    analise.possivel_vazamento
                      ? "text-red-300"
                      : "text-emerald-300"
                  }`}
                >
                  {analise.possivel_vazamento
                    ? "Possível vazamento identificado"
                    : "Nenhum vazamento identificado"}
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {analise.alerta}
                </p>

                <p className="mt-3 text-xs text-slate-400">
                  Status retornado: {analise.status}
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className={card}>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">Leituras analisadas</p>

                <Activity className="h-5 w-5 text-blue-400" />
              </div>

              <p className="mt-5 text-2xl font-bold">
                {analise.quantidade_leituras_analisadas ?? "—"}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Quantidade de registros considerados
              </p>
            </div>

            <div className={card}>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">
                  Vazão média da sequência
                </p>

                <Waves className="h-5 w-5 text-cyan-400" />
              </div>

              <p className="mt-5 text-2xl font-bold">
                {formatarNumero(
                  analise.sequencia_analisada?.vazao_media_litros_minuto,
                )}{" "}
                L/min
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Média da sequência analisada
              </p>
            </div>

            <div className={`${card} sm:col-span-2 xl:col-span-1`}>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">Duração da sequência</p>

                <Clock3 className="h-5 w-5 text-indigo-400" />
              </div>

              <p className="mt-5 text-2xl font-bold">
                {formatarDuracao(analise.sequencia_analisada?.duracao_segundos)}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Tempo de fluxo analisado
              </p>
            </div>
          </section>

          {analise.sequencia_analisada && (
            <section className={painel}>
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-blue-500/10 p-3">
                  <Clock3 className="h-5 w-5 text-blue-400" />
                </div>

                <div>
                  <h2 className="font-semibold">
                    Sequência de leituras analisada
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Intervalo utilizado na verificação de fluxo contínuo
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-blue-400/10 bg-blue-500/5 p-4">
                  <p className="text-xs text-slate-400">Início da sequência</p>

                  <p className="mt-2 font-semibold">
                    {formatarDataHora(analise.sequencia_analisada.inicio)}
                  </p>
                </div>

                <div className="rounded-xl border border-blue-400/10 bg-blue-500/5 p-4">
                  <p className="text-xs text-slate-400">Fim da sequência</p>

                  <p className="mt-2 font-semibold">
                    {formatarDataHora(analise.sequencia_analisada.fim)}
                  </p>
                </div>

                <div className="rounded-xl border border-blue-400/10 bg-blue-500/5 p-4">
                  <p className="text-xs text-slate-400">
                    Quantidade de leituras na sequência
                  </p>

                  <p className="mt-2 font-semibold">
                    {analise.sequencia_analisada.quantidade_leituras}
                  </p>
                </div>

                <div className="rounded-xl border border-blue-400/10 bg-blue-500/5 p-4">
                  <p className="text-xs text-slate-400">Duração</p>

                  <p className="mt-2 font-semibold">
                    {formatarDuracao(
                      analise.sequencia_analisada.duracao_segundos,
                    )}
                  </p>
                </div>
              </div>
            </section>
          )}

          {analise.parametros && (
            <section className={painel}>
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-blue-500/10 p-3">
                  <Activity className="h-5 w-5 text-blue-400" />
                </div>

                <div>
                  <h2 className="font-semibold">Parâmetros de detecção</h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Critérios utilizados pelo sistema na identificação de
                    vazamentos
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-blue-400/10 bg-blue-500/5 p-4">
                  <p className="text-xs text-slate-400">Limiar de vazão</p>

                  <p className="mt-3 text-lg font-semibold">
                    {formatarNumero(
                      analise.parametros.limiar_vazao_litros_minuto,
                    )}{" "}
                    L/min
                  </p>
                </div>

                <div className="rounded-xl border border-blue-400/10 bg-blue-500/5 p-4">
                  <p className="text-xs text-slate-400">Duração mínima</p>

                  <p className="mt-3 text-lg font-semibold">
                    {formatarDuracao(
                      analise.parametros.duracao_minima_segundos,
                    )}
                  </p>
                </div>

                <div className="rounded-xl border border-blue-400/10 bg-blue-500/5 p-4">
                  <p className="text-xs text-slate-400">
                    Intervalo máximo entre leituras
                  </p>

                  <p className="mt-3 text-lg font-semibold">
                    {formatarDuracao(
                      analise.parametros
                        .intervalo_maximo_entre_leituras_segundos,
                    )}
                  </p>
                </div>
              </div>
            </section>
          )}

          <section className={painel}>
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-blue-500/10 p-3">
                <Info className="h-5 w-5 text-blue-400" />
              </div>

              <div>
                <h2 className="font-semibold">Orientações</h2>

                <p className="mt-1 text-xs text-slate-500">
                  Informações sobre o resultado da análise
                </p>
              </div>
            </div>

            {analise.possivel_vazamento ? (
              <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" />

                  <p className="text-sm leading-6 text-slate-300">
                    Foi identificado um padrão que pode indicar vazamento.
                    Verifique torneiras, tubulações, descargas e outros pontos
                    de consumo. Caso o fluxo permaneça contínuo sem utilização
                    de água, considere solicitar uma inspeção.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />

                  <p className="text-sm leading-6 text-slate-300">
                    A análise não identificou padrões compatíveis com os
                    critérios de vazamento configurados. Continue acompanhando
                    as medições, pois esse resultado não descarta todos os tipos
                    de vazamento.
                  </p>
                </div>
              </div>
            )}
          </section>

          {(analise.observacao || analise.tipo_analise) && (
            <section className={painel}>
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-blue-500/10 p-3">
                  <Info className="h-5 w-5 text-blue-400" />
                </div>

                <h2 className="font-semibold">Detalhes da análise</h2>
              </div>

              {analise.tipo_analise && (
                <div className="mb-4">
                  <p className="text-xs text-blue-400">Tipo de análise</p>

                  <p className="mt-2 text-sm text-slate-300">
                    {analise.tipo_analise}
                  </p>
                </div>
              )}

              {analise.observacao && (
                <div className="border-t border-blue-400/10 pt-4">
                  <p className="text-xs text-blue-400">Observação</p>

                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {analise.observacao}
                  </p>
                </div>
              )}
            </section>
          )}
        </>
      )}

      <footer className="mt-8 flex flex-col items-center justify-center gap-2 border-t border-blue-400/10 py-6 text-center text-xs text-slate-500">
        <p>Monitoramento inteligente de água</p>
        <p>Projeto de TCC · 2026</p>
      </footer>
    </div>
  );
}
