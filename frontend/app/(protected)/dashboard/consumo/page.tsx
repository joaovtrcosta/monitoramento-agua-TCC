"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Droplets,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import {
  Bar,
  BarChart,
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

type ConsumoDiario = {
  data: string;
  dia: number;
  consumoLitros: number;
  consumoGrafico: number | null;
};

const API = "http://localhost:8080/api/medicoes";

const formatarNumero = (valor: number) =>
  valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function obterMesAtual() {
  const hoje = new Date();

  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(
    2,
    "0",
  )}`;
}

function formatarDataLocal(data: Date) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(data.getDate()).padStart(2, "0")}`;
}

function obterDataMedicao(dataHora: string) {
  const dataISO = dataHora.match(/^\d{4}-\d{2}-\d{2}/);

  if (dataISO) return dataISO[0];

  const data = new Date(dataHora);

  if (Number.isNaN(data.getTime())) return null;

  return formatarDataLocal(data);
}

export default function ConsumoPage() {
  const router = useRouter();

  const [medicoes, setMedicoes] = useState<Medicao[]>([]);
  const [mesSelecionado, setMesSelecionado] = useState(obterMesAtual);
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarMedicoes = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    setCarregando(true);
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
        throw new Error("Erro ao buscar medições.");
      }

      const dados: Medicao[] = await resposta.json();

      setMedicoes(Array.isArray(dados) ? dados : []);
    } catch (error) {
      console.error("Erro ao carregar consumo:", error);
      setErro("Não foi possível carregar as medições.");
    } finally {
      setCarregando(false);
    }
  }, [router]);

  useEffect(() => {
    void carregarMedicoes();
  }, [carregarMedicoes]);

  const [ano, mes] = mesSelecionado.split("-").map(Number);

  const quantidadeDias = new Date(ano, mes, 0).getDate();

  const consumoPorDia = useMemo(() => {
    const acumulado = new Map<string, number>();

    medicoes.forEach((medicao) => {
      const data = obterDataMedicao(medicao.dataHora);

      if (!data || !data.startsWith(mesSelecionado)) return;

      const volume = Number(medicao.volumeLitros ?? 0);

      if (!Number.isFinite(volume)) return;

      acumulado.set(data, (acumulado.get(data) ?? 0) + volume);
    });

    const resultado: ConsumoDiario[] = [];

    for (let dia = 1; dia <= quantidadeDias; dia++) {
      const data = `${mesSelecionado}-${String(dia).padStart(2, "0")}`;

      resultado.push({
        data,
        dia,
        consumoLitros: acumulado.get(data) ?? 0,
        consumoGrafico: acumulado.has(data) ? acumulado.get(data)! : null,
      });
    }

    return resultado;
  }, [medicoes, mesSelecionado, quantidadeDias]);

  const diasComRegistro = useMemo(() => {
    return new Set(
      medicoes
        .map((medicao) => obterDataMedicao(medicao.dataHora))
        .filter((data): data is string => Boolean(data)),
    );
  }, [medicoes]);

  const estatisticas = useMemo(() => {
    const total = consumoPorDia.reduce(
      (soma, item) => soma + item.consumoLitros,
      0,
    );

    const diasRegistrados = consumoPorDia.filter((item) =>
      diasComRegistro.has(item.data),
    );

    const maiorConsumo = consumoPorDia.reduce<ConsumoDiario | null>(
      (maior, item) =>
        !maior || item.consumoLitros > maior.consumoLitros ? item : maior,
      null,
    );

    return {
      total,
      media: diasRegistrados.length > 0 ? total / diasRegistrados.length : 0,
      maiorConsumo: diasRegistrados.length > 0 ? maiorConsumo : null,
      diasRegistrados: diasRegistrados.length,
    };
  }, [consumoPorDia, diasComRegistro]);

  function mudarMes(diferenca: number) {
    const novaData = new Date(ano, mes - 1 + diferenca, 1);

    const novoMes = `${novaData.getFullYear()}-${String(
      novaData.getMonth() + 1,
    ).padStart(2, "0")}`;

    setMesSelecionado(novoMes);
    setDiaSelecionado(null);
  }

  const nomeMes = new Date(ano, mes - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  const consumoSelecionado = consumoPorDia.find(
    (item) => item.data === diaSelecionado,
  );

  const primeiroDiaSemana = new Date(ano, mes - 1, 1).getDay();

  const painel =
    "rounded-2xl border border-blue-400/10 bg-blue-950/20 p-5 sm:p-6";

  const card = "rounded-2xl border border-blue-400/10 bg-blue-950/20 p-5";

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
            Monitoramento
          </p>

          <h1 className="text-3xl font-bold">Consumo diário</h1>

          <p className="mt-2 text-sm text-slate-400">
            Acompanhe o consumo de água ao longo dos dias.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void carregarMedicoes()}
          disabled={carregando}
          className="flex w-fit items-center gap-2 rounded-xl border border-blue-400/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-300 transition hover:bg-blue-500/20 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${carregando ? "animate-spin" : ""}`}
          />
          Atualizar
        </button>
      </div>

      {erro && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          {erro}
        </div>
      )}

      <div className={`${painel} flex items-center justify-between`}>
        <button
          type="button"
          onClick={() => mudarMes(-1)}
          aria-label="Mês anterior"
          className="rounded-xl border border-blue-400/20 p-3 transition hover:bg-blue-500/10"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="text-center">
          <p className="text-xs text-slate-500">Período selecionado</p>

          <h2 className="mt-1 text-lg font-semibold capitalize">{nomeMes}</h2>
        </div>

        <button
          type="button"
          onClick={() => mudarMes(1)}
          aria-label="Próximo mês"
          className="rounded-xl border border-blue-400/20 p-3 transition hover:bg-blue-500/10"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className={card}>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Consumo total</p>

            <Droplets className="h-5 w-5 text-blue-400" />
          </div>

          <p className="mt-5 text-2xl font-bold">
            {carregando ? "—" : `${formatarNumero(estatisticas.total)} L`}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Volume do mês selecionado
          </p>
        </div>

        <div className={card}>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Média diária</p>

            <BarChart3 className="h-5 w-5 text-indigo-400" />
          </div>

          <p className="mt-5 text-2xl font-bold">
            {carregando ? "—" : `${formatarNumero(estatisticas.media)} L`}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Média dos dias com registros
          </p>
        </div>

        <div className={`${card} sm:col-span-2 xl:col-span-1`}>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Maior consumo diário</p>

            <TrendingUp className="h-5 w-5 text-emerald-400" />
          </div>

          <p className="mt-5 text-2xl font-bold">
            {carregando
              ? "—"
              : estatisticas.maiorConsumo
                ? `${formatarNumero(estatisticas.maiorConsumo.consumoLitros)} L`
                : "Sem dados"}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            {estatisticas.maiorConsumo
              ? `Dia ${estatisticas.maiorConsumo.dia}`
              : "Nenhum registro no período"}
          </p>
        </div>
      </div>

      <section className={painel}>
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-blue-500/10 p-3">
            <BarChart3 className="h-5 w-5 text-blue-400" />
          </div>

          <div>
            <h2 className="font-semibold">Gráfico de consumo diário</h2>

            <p className="mt-1 text-xs text-slate-500">
              Volume de água consumido por dia, em litros
            </p>
          </div>
        </div>

        {carregando ? (
          <div className="flex h-80 items-center justify-center text-sm text-slate-400">
            Carregando gráfico...
          </div>
        ) : estatisticas.diasRegistrados === 0 ? (
          <div className="flex h-80 items-center justify-center rounded-xl border border-dashed border-blue-400/10 text-sm text-slate-400">
            Nenhuma medição encontrada neste mês.
          </div>
        ) : (
          <div className="h-80 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={consumoPorDia}
                barCategoryGap="20%"
                margin={{
                  top: 15,
                  right: 10,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  stroke="#1e3a5f"
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="dia"
                  stroke="#64748b"
                  tick={{
                    fontSize: 11,
                    fill: "#94a3b8",
                  }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                  minTickGap={12}
                />

                <YAxis
                  stroke="#64748b"
                  tick={{
                    fontSize: 11,
                    fill: "#94a3b8",
                  }}
                  tickLine={false}
                  axisLine={false}
                  width={45}
                  domain={[0, "auto"]}
                />

                <Tooltip
                  cursor={{
                    fill: "rgba(59, 130, 246, 0.08)",
                  }}
                  contentStyle={{
                    backgroundColor: "#081a36",
                    border: "1px solid rgba(59, 130, 246, 0.35)",
                    borderRadius: 12,
                    padding: "12px 16px",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
                  }}
                  labelStyle={{
                    color: "#cbd5e1",
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                  itemStyle={{
                    color: "#60a5fa",
                  }}
                  formatter={(value) => [
                    `${formatarNumero(Number(value ?? 0))} L`,
                    "Consumo",
                  ]}
                  labelFormatter={(label) => `Dia ${label}`}
                />

                <Bar
                  dataKey="consumoGrafico"
                  name="Consumo"
                  fill="#3b82f6"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={28}
                  activeBar={{
                    fill: "#60a5fa",
                    stroke: "#93c5fd",
                    strokeWidth: 1,
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className={painel}>
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-blue-500/10 p-3">
            <CalendarDays className="h-5 w-5 text-blue-400" />
          </div>

          <div>
            <h2 className="font-semibold">Calendário de consumo</h2>

            <p className="mt-1 text-xs text-slate-500">
              Selecione um dia para visualizar o consumo.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((dia) => (
            <div
              key={dia}
              className="py-2 text-center text-xs font-medium text-slate-500"
            >
              {dia}
            </div>
          ))}

          {Array.from({ length: primeiroDiaSemana }, (_, indice) => (
            <div key={`vazio-${indice}`} />
          ))}

          {consumoPorDia.map((item) => {
            const selecionado = diaSelecionado === item.data;

            const possuiRegistro = diasComRegistro.has(item.data);

            return (
              <button
                type="button"
                key={item.data}
                onClick={() => setDiaSelecionado(item.data)}
                className={`min-h-16 rounded-xl border p-2 text-center transition sm:min-h-20 ${
                  selecionado
                    ? "border-blue-400 bg-blue-500/20"
                    : "border-blue-400/10 bg-blue-500/5 hover:border-blue-400/30"
                }`}
              >
                <span className="block text-sm font-semibold">{item.dia}</span>

                <span
                  className={`mt-2 block text-[10px] sm:text-xs ${
                    possuiRegistro ? "text-blue-300" : "text-slate-600"
                  }`}
                >
                  {possuiRegistro
                    ? `${formatarNumero(item.consumoLitros)} L`
                    : "—"}
                </span>
              </button>
            );
          })}
        </div>

        {consumoSelecionado && (
          <div className="mt-5 rounded-xl border border-blue-400/20 bg-blue-500/10 p-5">
            <p className="text-sm text-slate-400">
              Consumo em{" "}
              {new Date(
                `${consumoSelecionado.data}T12:00:00`,
              ).toLocaleDateString("pt-BR")}
            </p>

            {diasComRegistro.has(consumoSelecionado.data) ? (
              <p className="mt-2 text-2xl font-bold text-blue-300">
                {formatarNumero(consumoSelecionado.consumoLitros)} litros
              </p>
            ) : (
              <p className="mt-2 text-sm text-slate-400">
                Não há medições registradas neste dia.
              </p>
            )}
          </div>
        )}
      </section>

      <footer className="mt-8 flex flex-col items-center justify-center gap-2 border-t border-blue-400/10 py-6 text-center text-xs text-slate-500">
        <p>Monitoramento inteligente de água</p>
        <p>Projeto de TCC · 2026</p>
      </footer>
    </div>
  );
}
