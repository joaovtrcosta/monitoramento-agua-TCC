"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Droplets,
  Info,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

type Medicao = {
  medicaoId: string;
  dataHora: string;
  vazao: number;
  volumeLitros: number;
};

type DiaAtipico = {
  data: string;
  volume_litros: number;
  motivo: string;
  mediana_litros: number;
  diferenca_percentual_mediana: number | null;
  nivel_atencao: "moderado" | "alto";
};

type AnaliseHistorico = {
  quantidade_dias: number;
  periodo: {
    inicio: string;
    fim: string;
  };
  consumo_total_litros: number;
  media_diaria_litros: number;
  mediana_diaria_litros: number;
  maior_consumo: {
    data: string;
    volume_litros: number;
  };
  limite_atipico_litros: number;
  primeiro_quartil_litros: number | null;
  terceiro_quartil_litros: number | null;
  intervalo_interquartil_litros: number | null;
  dias_com_consumo_atipico: DiaAtipico[];
  metodo: string;
  observacao: string;
  previsao_disponivel: boolean;
  motivo_sem_previsao?: string;
};

const API = "http://localhost:8080/api/medicoes";

function formatarNumero(valor: number | null | undefined) {
  if (valor === null || valor === undefined) return "—";

  return Number(valor).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatarData(data: string | undefined) {
  if (!data) return "—";

  const partes = data.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (partes) {
    return `${partes[3]}/${partes[2]}/${partes[1]}`;
  }

  const convertida = new Date(data);

  if (Number.isNaN(convertida.getTime())) return data;

  return convertida.toLocaleDateString("pt-BR");
}

export default function AnalisesPage() {
  const router = useRouter();

  const [analise, setAnalise] = useState<AnaliseHistorico | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [semMedicoes, setSemMedicoes] = useState(false);

  const carregarAnalise = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    setCarregando(true);
    setErro(null);
    setSemMedicoes(false);

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    try {
      const respostaMedicoes = await fetch(API, {
        headers,
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
        setAnalise(null);
        setSemMedicoes(true);
        return;
      }

      const respostaAnalise = await fetch(`${API}/analisar-ia`, {
        method: "POST",
        headers,
      });

      if (respostaAnalise.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!respostaAnalise.ok) {
        const mensagem = await respostaAnalise.text().catch(() => "");

        console.error("Erro na análise de consumo:", mensagem);

        throw new Error("Não foi possível realizar a análise de consumo.");
      }

      const resultado: AnaliseHistorico = await respostaAnalise.json();

      setAnalise(resultado);
    } catch (error) {
      console.error("Erro ao carregar análise:", error);

      setAnalise(null);
      setErro(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao carregar a análise.",
      );
    } finally {
      setCarregando(false);
    }
  }, [router]);

  useEffect(() => {
    void carregarAnalise();
  }, [carregarAnalise]);

  const diasAtipicos = analise?.dias_com_consumo_atipico ?? [];

  const painel =
    "rounded-2xl border border-blue-400/10 bg-blue-950/20 p-5 sm:p-6";

  const card = "rounded-2xl border border-blue-400/10 bg-blue-950/20 p-5";

  return (
    <div className="space-y-6 text-white">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
            Inteligência e monitoramento
          </p>

          <h1 className="text-3xl font-bold">Análise de consumo</h1>

          <p className="mt-2 text-sm text-slate-400">
            Acompanhe seus padrões de consumo e identifique dias com volumes
            fora do habitual.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void carregarAnalise()}
          disabled={carregando}
          className="flex w-fit items-center gap-2 rounded-xl border border-blue-400/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-300 transition hover:bg-blue-500/20 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${carregando ? "animate-spin" : ""}`}
          />
          Atualizar análise
        </button>
      </section>

      {erro && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-5">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />

          <div>
            <p className="font-medium text-red-300">Erro ao realizar análise</p>

            <p className="mt-2 text-sm text-slate-400">{erro}</p>
          </div>
        </div>
      )}

      {carregando && (
        <div className={`${painel} py-16 text-center`}>
          <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-400" />

          <p className="font-medium">Analisando consumo...</p>

          <p className="mt-2 text-sm text-slate-400">
            Aguarde enquanto o sistema processa o histórico de medições.
          </p>
        </div>
      )}

      {!carregando && semMedicoes && (
        <div className={`${painel} py-14 text-center`}>
          <Droplets className="mx-auto mb-4 h-10 w-10 text-blue-400" />

          <h2 className="text-lg font-semibold">Nenhuma medição disponível</h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
            Ainda não existem medições de consumo cadastradas. Assim que houver
            registros, será possível realizar a análise.
          </p>
        </div>
      )}

      {!carregando && analise && (
        <>
          <section className={painel}>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-500/10 p-3">
                  <CalendarDays className="h-5 w-5 text-blue-400" />
                </div>

                <div>
                  <h2 className="font-semibold">Período analisado</h2>

                  <p className="mt-1 text-sm text-slate-400">
                    {formatarData(analise.periodo.inicio)}
                    {" até "}
                    {formatarData(analise.periodo.fim)}
                  </p>
                </div>
              </div>

              <span className="w-fit rounded-xl border border-blue-400/15 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
                {analise.quantidade_dias} dias analisados
              </span>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className={card}>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">Consumo total</p>

                <div className="rounded-xl bg-blue-500/10 p-2.5">
                  <Droplets className="h-5 w-5 text-blue-400" />
                </div>
              </div>

              <p className="mt-5 text-2xl font-bold">
                {formatarNumero(analise.consumo_total_litros)} L
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Volume registrado no período analisado
              </p>
            </div>

            <div className={card}>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">Média diária</p>

                <div className="rounded-xl bg-indigo-500/10 p-2.5">
                  <BarChart3 className="h-5 w-5 text-indigo-400" />
                </div>
              </div>

              <p className="mt-5 text-2xl font-bold">
                {formatarNumero(analise.media_diaria_litros)} L
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Volume médio consumido por dia
              </p>
            </div>

            <div className={`${card} sm:col-span-2 xl:col-span-1`}>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">
                  Dias com consumo atípico
                </p>

                <div className="rounded-xl bg-amber-500/10 p-2.5">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                </div>
              </div>

              <p className="mt-5 text-2xl font-bold">{diasAtipicos.length}</p>

              <p className="mt-2 text-xs text-slate-500">
                Dias com consumo acima do padrão identificado
              </p>
            </div>
          </section>

          <section className={painel}>
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-blue-500/10 p-3">
                <TrendingUp className="h-5 w-5 text-blue-400" />
              </div>

              <div>
                <h2 className="font-semibold">Maior consumo registrado</h2>

                <p className="mt-1 text-xs text-slate-500">
                  Dia de maior consumo no período analisado
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-4 rounded-xl border border-blue-400/10 bg-blue-500/5 p-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm text-slate-400">Data</p>

                <p className="mt-2 text-lg font-semibold">
                  {formatarData(analise.maior_consumo?.data)}
                </p>
              </div>

              <div className="sm:text-right">
                <p className="text-sm text-slate-400">Volume consumido</p>

                <p className="mt-2 text-2xl font-bold text-blue-300">
                  {formatarNumero(analise.maior_consumo?.volume_litros)} L
                </p>
              </div>
            </div>
          </section>

          <section className={painel}>
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-amber-500/10 p-3">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              </div>

              <div>
                <h2 className="font-semibold">Consumos fora do padrão</h2>

                <p className="mt-1 text-xs text-slate-500">
                  Confira os dias que merecem atenção
                </p>
              </div>
            </div>

            {diasAtipicos.length === 0 ? (
              <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />

                <div>
                  <p className="font-medium text-emerald-300">
                    Nenhum consumo atípico identificado
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Os registros analisados não ultrapassaram o limite
                    estatístico utilizado pelo sistema. Continue acompanhando
                    seu consumo regularmente.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                  <p className="text-sm leading-6 text-amber-200">
                    Foram identificados <strong>{diasAtipicos.length}</strong>{" "}
                    dias com consumo fora do padrão. Esses registros merecem
                    atenção, mas não confirmam a existência de vazamentos.
                  </p>
                </div>

                {diasAtipicos.map((dia, indice) => (
                  <div
                    key={`${dia.data}-${indice}`}
                    className="rounded-xl border border-blue-400/10 bg-blue-500/5 p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-slate-500">
                          Data do registro
                        </p>

                        <p className="mt-1 font-semibold">
                          {formatarData(dia.data)}
                        </p>
                      </div>

                      <span
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                          dia.nivel_atencao === "alto"
                            ? "border-red-500/20 bg-red-500/10 text-red-300"
                            : "border-amber-500/20 bg-amber-500/10 text-amber-300"
                        }`}
                      >
                        Atenção{" "}
                        {dia.nivel_atencao === "alto" ? "alta" : "moderada"}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-slate-500">
                          Consumo registrado
                        </p>

                        <p className="mt-2 text-xl font-bold text-blue-300">
                          {formatarNumero(dia.volume_litros)} L
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Comparação com o consumo habitual
                        </p>

                        <p className="mt-2 font-semibold">
                          {dia.diferenca_percentual_mediana === null
                            ? "Comparação indisponível"
                            : `${
                                dia.diferenca_percentual_mediana > 0 ? "+" : ""
                              }${formatarNumero(
                                dia.diferenca_percentual_mediana,
                              )}%`}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Diferença em relação à mediana diária do período
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-blue-400/10 pt-4">
                      <p className="text-xs font-medium text-slate-400">
                        Detalhes da identificação
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        {dia.motivo}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className={painel}>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-500/10 p-3">
                <Info className="h-5 w-5 text-blue-400" />
              </div>

              <div>
                <h2 className="font-semibold">Como funciona esta análise?</h2>

                <p className="mt-1 text-xs text-slate-500">
                  Entenda os resultados apresentados
                </p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-7 text-slate-300">
              O sistema analisa o histórico de consumo de água e utiliza
              critérios estatísticos para identificar dias com volumes acima do
              padrão. Isso ajuda a reconhecer alterações no consumo e possíveis
              situações de desperdício.
            </p>

            <div className="mt-5 flex items-start gap-3 rounded-xl border border-blue-400/10 bg-blue-500/5 p-4">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />

              <p className="text-sm leading-6 text-slate-400">
                Um consumo atípico não significa, necessariamente, que existe um
                vazamento. Para investigar possíveis vazamentos, utilize também
                a página de Alertas.
              </p>
            </div>
          </section>
        </>
      )}

      <footer className="mt-8 flex flex-col items-center justify-center gap-2 border-t border-blue-400/10 py-6 text-center text-xs text-slate-500">
        <p>Monitoramento inteligente de água</p>
        <p>Projeto de TCC · 2026</p>
      </footer>
    </div>
  );
}
