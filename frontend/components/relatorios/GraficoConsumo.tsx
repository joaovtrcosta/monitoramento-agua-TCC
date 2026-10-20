"use client";

import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

interface DadoConsumo {
  ano: number;
  mes: number;
  consumoLitros: number;
}

interface GraficoConsumoProps {
  dados: DadoConsumo[];
}

const nomesMeses = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

const cores = [
  "#3b82f6",
  "#34d399",
  "#f59e0b",
  "#a78bfa",
  "#f87171",
  "#22d3ee",
  "#facc15",
];

export default function GraficoConsumo({
  dados,
}: GraficoConsumoProps) {
  const anos = [...new Set(dados.map((item) => item.ano))].sort(
    (a, b) => a - b
  );

  const dadosGrafico = nomesMeses.map((nome, indice) => {
    const linha: Record<string, string | number> = {
      mes: nome,
    };

    anos.forEach((ano) => {
      const item = dados.find(
        (d) => d.ano === ano && d.mes === indice + 1
      );

      linha[String(ano)] = Number(item?.consumoLitros ?? 0);
    });

    return linha;
  });

  return (
    <section className="rounded-2xl border border-blue-400/10 bg-blue-950/20 p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-white">
          Consumo mensal de água
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Compare o consumo de cada mês entre os anos selecionados.
        </p>
      </div>

      <div id="grafico-consumo" className="h-72 w-full sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={dadosGrafico}
            margin={{ top: 8, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              stroke="#60a5fa"
              strokeOpacity={0.12}
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="mes"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={{ stroke: "#334155" }}
              tickLine={false}
            />

            <YAxis
              width={55}
              tickFormatter={(valor: number) =>
                valor.toLocaleString("pt-BR")
              }
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#030d29",
                border: "1px solid rgba(96, 165, 250, 0.25)",
                borderRadius: "12px",
                color: "#f8fafc",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
              }}
              labelStyle={{
                color: "#93c5fd",
                fontWeight: 600,
                marginBottom: "6px",
              }}
              itemStyle={{
                color: "#e2e8f0",
                fontSize: "12px",
              }}
              cursor={{ fill: "#3b82f6", fillOpacity: 0.08 }}
              formatter={(valor, nome) => [
                `${Number(valor).toLocaleString("pt-BR", {
                  maximumFractionDigits: 3,
                })} L`,
                String(nome),
              ]}
              labelFormatter={(label) => `Mês: ${label}`}
            />

            <Legend
              wrapperStyle={{
                color: "#cbd5e1",
                fontSize: "12px",
                paddingTop: "12px",
              }}
            />

            {anos.map((ano, indice) => (
              <Bar
                key={ano}
                dataKey={String(ano)}
                name={String(ano)}
                fill={cores[indice % cores.length]}
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}