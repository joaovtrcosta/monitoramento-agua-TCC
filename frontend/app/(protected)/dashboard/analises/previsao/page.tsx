"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  Droplets,
  Info,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Medicao = {
  medicaoId: string;
  dataHora: string;
  vazao: number;
  volumeLitros: number;
};

type PrevisaoConsumo = {
  data: string;
  volume_previsto_litros: number;
};

type ResultadoPrevisao = {
  status: string;
  tipo_modelo: string;
  quantidade_dias_historicos: number;
  periodo_historico: {
    inicio: string;
    fim: string;
  };
  periodo_previsao: {
    inicio: string;
    fim: string;
  };
  previsoes: PrevisaoConsumo[];
  observacao: string;
};

const API = "http://localhost:8080/api/medicoes";

function formatarNumero(valor: number) {
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

export default function PrevisaoPage() {
  const router = useRouter();

  const [resultado, setResultado] = useState<ResultadoPrevisao | null>(null);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [semMedicoes, setSemMedicoes] = useState(false);

  const carregarPrevisao = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    setCarregando(true);
    setErro(null);
    setSemMedicoes(false);
    setResultado(null);

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
        setSemMedicoes(true);
        return;
      }

      const respostaPrevisao = await fetch(`${API}/prever-consumo`, {
        method: "POST",
        headers,
      });

      if (respostaPrevisao.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!respostaPrevisao.ok) {
        const mensagem = await respostaPrevisao.text().catch(() => "");

        console.error("Erro ao solicitar previsão:", mensagem);

        throw new Error("Não foi possível gerar a previsão de consumo.");
      }

      const dados: ResultadoPrevisao = await respostaPrevisao.json();

      setResultado(dados);
    } catch (error) {
      console.error("Erro na previsão:", error);

      setErro(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao gerar a previsão.",
      );
    } finally {
      setCarregando(false);
    }
  }, [router]);

  useEffect(() => {
    void carregarPrevisao();
  }, [carregarPrevisao]);

  const previsoes = resultado?.previsoes ?? [];

  const estatisticas = useMemo(() => {
    if (previsoes.length === 0) {
      return {
        total: 0,
        media: 0,
        maior: null as PrevisaoConsumo | null,
      };
    }

    const total = previsoes.reduce(
      (soma, item) => soma + Number(item.volume_previsto_litros ?? 0),
      0,
    );

    const maior = previsoes.reduce((atual, item) =>
      item.volume_previsto_litros > atual.volume_previsto_litros ? item : atual,
    );

    return {
      total,
      media: total / previsoes.length,
      maior,
    };
  }, [previsoes]);

  const dadosGrafico = useMemo(
    () =>
      previsoes.map((item) => ({
        data: item.data,
        dia: formatarData(item.data),
        consumo: Number(item.volume_previsto_litros ?? 0),
      })),
    [previsoes],
  );

  const painel =
    "rounded-2xl border border-blue-400/10 bg-blue-950/20 p-5 sm:p-6";

  const card = "rounded-2xl border border-blue-400/10 bg-blue-950/20 p-5";

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
            Inteligência e monitoramento
          </p>

          <h1 className="text-3xl font-bold">Previsão de consumo</h1>

          <p className="mt-2 text-sm text-slate-400">
            Estimativa do consumo futuro de água com base no histórico de
            medições.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void carregarPrevisao()}
          disabled={carregando}
          className="flex w-fit items-center gap-2 rounded-xl border border-blue-400/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-300 transition hover:bg-blue-500/20 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${carregando ? "animate-spin" : ""}`}
          />
          Atualizar previsão
        </button>
      </section>

      {erro && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-5">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />

          <div>
            <p className="font-medium text-red-300">Erro ao gerar previsão</p>

            <p className="mt-2 text-sm text-slate-400">{erro}</p>
          </div>
        </div>
      )}

      {carregando && (
        <div className={`${painel} py-16 text-center`}>
          <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-400" />

          <p className="font-medium">Gerando previsão...</p>

          <p className="mt-2 text-sm text-slate-400">
            Aguarde enquanto o modelo analisa o histórico de consumo.
          </p>
        </div>
      )}

      {!carregando && semMedicoes && (
        <div className={`${painel} py-14 text-center`}>
          <Droplets className="mx-auto mb-4 h-10 w-10 text-blue-400" />

          <h2 className="text-lg font-semibold">Nenhuma medição disponível</h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
            Ainda não existem medições cadastradas. A previsão ficará disponível
            quando houver histórico suficiente para o modelo.
          </p>
        </div>
      )}

      {!carregando && resultado && (
        <>
          <section className={painel}>
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-500/10 p-3">
                  <CalendarDays className="h-5 w-5 text-blue-400" />
                </div>

                <div>
                  <h2 className="font-semibold">Período da previsão</h2>

                  <p className="mt-1 text-sm text-slate-400">
                    {formatarData(resultado.periodo_previsao?.inicio)}
                    {" até "}
                    {formatarData(resultado.periodo_previsao?.fim)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-xl border border-blue-400/15 bg-blue-500/10 px-4 py-2 text-xs text-blue-300">
                  {resultado.quantidade_dias_historicos} dias de histórico
                </span>

                <span className="rounded-xl border border-emerald-500/15 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-300">
                  {resultado.status}
                </span>
              </div>
            </div>
          </section>

          {previsoes.length > 0 ? (
            <>
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div className={card}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400">
                      Consumo total previsto
                    </p>

                    <Droplets className="h-5 w-5 text-blue-400" />
                  </div>

                  <p className="mt-5 text-2xl font-bold">
                    {formatarNumero(estatisticas.total)} L
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Soma dos volumes previstos
                  </p>
                </div>

                <div className={card}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400">
                      Média diária prevista
                    </p>

                    <BarChart3 className="h-5 w-5 text-indigo-400" />
                  </div>

                  <p className="mt-5 text-2xl font-bold">
                    {formatarNumero(estatisticas.media)} L
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Média dos dias previstos
                  </p>
                </div>

                <div className={`${card} sm:col-span-2 xl:col-span-1`}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400">
                      Maior consumo previsto
                    </p>

                    <TrendingUp className="h-5 w-5 text-cyan-400" />
                  </div>

                  <p className="mt-5 text-2xl font-bold">
                    {estatisticas.maior
                      ? `${formatarNumero(
                          estatisticas.maior.volume_previsto_litros,
                        )} L`
                      : "—"}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    {estatisticas.maior
                      ? `Dia ${formatarData(estatisticas.maior.data)}`
                      : "Sem previsão disponível"}
                  </p>
                </div>
              </section>

              <section className={painel}>
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-xl bg-blue-500/10 p-3">
                    <TrendingUp className="h-5 w-5 text-blue-400" />
                  </div>

                  <div>
                    <h2 className="font-semibold">Gráfico de previsão</h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Consumo estimado para os próximos dias
                    </p>
                  </div>
                </div>

                <div className="h-80 w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={dadosGrafico}
                      margin={{
                        top: 10,
                        right: 10,
                        left: 0,
                        bottom: 5,
                      }}
                    >
                      <defs>
                        <linearGradient
                          id="previsaoGradiente"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#3b82f6"
                            stopOpacity={0.35}
                          />

                          <stop
                            offset="100%"
                            stopColor="#3b82f6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        stroke="#1e3a5f"
                        strokeDasharray="3 3"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="dia"
                        stroke="#94a3b8"
                        tick={{ fontSize: 11 }}
                      />

                      <YAxis
                        stroke="#94a3b8"
                        tick={{ fontSize: 11 }}
                        width={55}
                      />

                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#081a36",
                          border: "1px solid #1e40af",
                          borderRadius: 12,
                          color: "#fff",
                        }}
                        labelStyle={{
                          color: "#cbd5e1",
                        }}
                        formatter={(value) => [
                          `${formatarNumero(Number(value ?? 0))} L`,
                          "Consumo previsto",
                        ]}
                      />

                      <Area
                        type="monotone"
                        dataKey="consumo"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fill="url(#previsaoGradiente)"
                        dot={{
                          fill: "#60a5fa",
                          strokeWidth: 2,
                          r: 4,
                        }}
                        activeDot={{
                          r: 6,
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className={painel}>
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-xl bg-blue-500/10 p-3">
                    <CalendarDays className="h-5 w-5 text-blue-400" />
                  </div>

                  <div>
                    <h2 className="font-semibold">Previsão por dia</h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Valores estimados pelo modelo
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-blue-400/10">
                  <table className="w-full min-w-112.5 text-left text-sm">
                    <thead className="bg-[#0b1d3d] text-xs uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="px-5 py-4 font-medium">Data</th>

                        <th className="px-5 py-4 font-medium">
                          Volume previsto
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-blue-400/10">
                      {previsoes.map((previsao, indice) => (
                        <tr
                          key={`${previsao.data}-${indice}`}
                          className="transition hover:bg-blue-500/5"
                        >
                          <td className="px-5 py-4 text-slate-300">
                            {formatarData(previsao.data)}
                          </td>

                          <td className="px-5 py-4">
                            <span className="inline-flex rounded-lg border border-blue-400/15 bg-blue-500/10 px-3 py-1.5 font-medium text-blue-300">
                              {formatarNumero(previsao.volume_previsto_litros)}{" "}
                              L
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          ) : (
            <section className={painel}>
              <div className="flex items-start gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" />

                <div>
                  <h2 className="font-semibold text-yellow-300">
                    Previsão ainda indisponível
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    O modelo não retornou valores previstos. Pode ser necessário
                    acumular mais dias de histórico para gerar uma previsão.
                  </p>
                </div>
              </div>
            </section>
          )}

          {previsoes.length > 0 && (
            <section className="rounded-2xl border border-blue-400/10 bg-blue-950/20 p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="shrink-0 rounded-xl bg-blue-500/10 p-3">
                  <Info className="h-5 w-5 text-blue-400" />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-white">Sobre a previsão</h2>

                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    Os valores apresentados são estimativas calculadas com base
                    no histórico de consumo de água. O consumo real pode variar
                    conforme os hábitos de utilização da residência.
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-blue-400/10 pt-4">
                    <CalendarDays className="h-4 w-4 text-blue-400" />

                    <p className="text-xs leading-5 text-slate-400">
                      Histórico analisado:{" "}
                      <span className="text-slate-300">
                        {formatarData(resultado.periodo_historico?.inicio)}
                        {" até "}
                        {formatarData(resultado.periodo_historico?.fim)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
