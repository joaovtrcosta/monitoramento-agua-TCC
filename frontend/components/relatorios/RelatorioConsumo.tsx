"use client";

import { useState } from "react";
import FiltroRelatorio, { type FiltrosRelatorio } from "./FiltroRelatorio";
import GraficoConsumo from "./GraficoConsumo";
import GerarPDF from "./GerarPDF";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CalendarDays,
  Droplets,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

interface RelatorioMensal {
  ano: number;
  mes: number;
  consumoLitros: number;
  consumoM3: number;
  valorAgua: number;
  valorEsgoto: number;
  valorEstimado: number;
}

const API = "http://localhost:8080/api/medicoes";

const nomesMeses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export default function RelatorioConsumo() {
  const [dados, setDados] = useState<RelatorioMensal[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function consultarRelatorio(filtros: FiltrosRelatorio) {
    setCarregando(true);
    setErro("");
    setDados([]);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Sua sessão expirou. Entre novamente no sistema.");
      }

      const filtrosComPeriodo = filtros as FiltrosRelatorio & {
        anoInicial?: number;
        mesInicial?: number;
        anoFinal?: number;
        mesFinal?: number;
      };

      let anoInicial: number;
      let mesInicial: number;
      let anoFinal: number;
      let mesFinal: number;

      if (
        filtrosComPeriodo.anoInicial !== undefined &&
        filtrosComPeriodo.mesInicial !== undefined &&
        filtrosComPeriodo.anoFinal !== undefined &&
        filtrosComPeriodo.mesFinal !== undefined
      ) {
        anoInicial = Number(filtrosComPeriodo.anoInicial);
        mesInicial = Number(filtrosComPeriodo.mesInicial);
        anoFinal = Number(filtrosComPeriodo.anoFinal);
        mesFinal = Number(filtrosComPeriodo.mesFinal);
      } else {
        const ano = Number(filtros.ano);

        let mesesSelecionados: number[];

        if (filtros.tipo === "mes") {
          mesesSelecionados = [filtros.mes];
        } else if (filtros.tipo === "varios") {
          mesesSelecionados = filtros.meses;
        } else {
          mesesSelecionados = Array.from({ length: 12 }, (_, i) => i + 1);
        }

        mesesSelecionados.sort((a, b) => a - b);

        if (mesesSelecionados.length === 0) {
          throw new Error("Selecione pelo menos um mês.");
        }

        anoInicial = ano;
        mesInicial = mesesSelecionados[0];
        anoFinal = ano;
        mesFinal = mesesSelecionados[mesesSelecionados.length - 1];

        // Mantém os meses selecionados individualmente quando
        // o filtro atual não representa um intervalo contínuo.
        if (filtros.tipo === "varios" || filtros.tipo === "mes") {
          const resultados = await Promise.all(
            mesesSelecionados.map(async (mes) => {
              const parametros = new URLSearchParams({
                anoInicial: String(ano),
                mesInicial: String(mes),
                anoFinal: String(ano),
                mesFinal: String(mes),
              });

              const resposta = await fetch(
                `${API}/relatorio-mensal?${parametros.toString()}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                },
              );

              if (!resposta.ok) {
                throw new Error(
                  `Não foi possível consultar ${nomesMeses[mes - 1]}.`,
                );
              }

              const lista: RelatorioMensal[] = await resposta.json();

              return lista;
            }),
          );

          const validos = resultados
            .flat()
            .filter((item): item is RelatorioMensal => item !== undefined)
            .sort((a, b) => a.ano - b.ano || a.mes - b.mes);

          setDados(validos);
          return;
        }
      }

      if (
        anoInicial > anoFinal ||
        (anoInicial === anoFinal && mesInicial > mesFinal)
      ) {
        throw new Error(
          "O período inicial deve ser anterior ao período final.",
        );
      }

      const parametros = new URLSearchParams({
        anoInicial: String(anoInicial),
        mesInicial: String(mesInicial),
        anoFinal: String(anoFinal),
        mesFinal: String(mesFinal),
      });

      const resposta = await fetch(
        `${API}/relatorio-mensal?${parametros.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!resposta.ok) {
        throw new Error("Não foi possível consultar o relatório.");
      }

      const lista: RelatorioMensal[] = await resposta.json();

      setDados(lista.sort((a, b) => a.ano - b.ano || a.mes - b.mes));
    } catch (e) {
      setErro(
        e instanceof Error
          ? e.message
          : "Ocorreu um erro ao consultar o relatório.",
      );
    } finally {
      setCarregando(false);
    }
  }

  const consumoTotal = dados.reduce(
    (total, item) => total + Number(item.consumoLitros || 0),
    0,
  );

  const valorTotal = dados.reduce(
    (total, item) => total + Number(item.valorEstimado || 0),
    0,
  );

  const periodoTexto =
    dados.length > 0
      ? `${nomesMeses[dados[0].mes - 1]} de ${dados[0].ano} até ${
          nomesMeses[dados[dados.length - 1].mes - 1]
        } de ${dados[dados.length - 1].ano}`
      : "";

  return (
    <main className="min-h-screen bg-[#020b24] text-white">
      <div className="mx-auto max-w-375 p-5 sm:p-8">
        <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-blue-400">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              Análise e acompanhamento
            </p>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl uppercase">
              Relatórios de consumo
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Consulte o histórico de consumo de água, compare períodos e
              acompanhe os valores estimados de água e esgoto.
            </p>
          </div>
        </section>

        <section className="mb-6 rounded-2xl border border-blue-400/10 bg-blue-950/20 p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <CalendarDays className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold">Período do relatório</h2>
              <p className="mt-1 text-xs text-slate-500">
                Selecione os meses que deseja analisar.
              </p>
            </div>
          </div>

          <FiltroRelatorio
            onConsultar={consultarRelatorio}
            carregando={carregando}
          />
        </section>

        {erro && (
          <div
            role="alert"
            className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400"
          >
            <AlertTriangle className="h-5 w-5 shrink-0" />
            {erro}
          </div>
        )}

        {carregando && (
          <div className="mb-6 flex items-center justify-center rounded-2xl border border-blue-400/10 bg-blue-950/20 py-12 text-sm text-slate-400">
            <RefreshCw className="mr-3 h-4 w-4 animate-spin text-blue-400" />
            Consultando relatório...
          </div>
        )}

        {dados.length > 0 && (
          <section className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <article className="rounded-2xl border border-blue-400/10 bg-blue-950/20 p-5 transition-all duration-300 hover:border-blue-400/25">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-400">Consumo total</span>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <Droplets className="h-5 w-5" />
                  </div>
                </div>

                <p className="mt-5 text-2xl font-bold">
                  {consumoTotal.toLocaleString("pt-BR", {
                    maximumFractionDigits: 3,
                  })}{" "}
                  <span className="text-base font-medium text-blue-300">L</span>
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Volume acumulado no período selecionado
                </p>
              </article>

              <article className="rounded-2xl border border-blue-400/10 bg-blue-950/20 p-5 transition-all duration-300 hover:border-blue-400/25">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-400">
                    Valor estimado total
                  </span>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>

                <p className="mt-5 text-2xl font-bold">
                  {valorTotal.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Estimativa acumulada de água e esgoto
                </p>
              </article>
            </div>

            <section className="overflow-hidden rounded-2xl border border-blue-400/10 bg-blue-950/20">
              <div className="flex flex-col gap-4 border-b border-blue-400/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <BarChart3 className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="font-semibold">Detalhamento mensal</h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {periodoTexto}
                    </p>
                  </div>
                </div>

                <GerarPDF dados={dados} />
              </div>

              <div className="p-4 sm:p-6">
                <GraficoConsumo dados={dados} />
              </div>

              <div className="border-t border-blue-400/10">
                <div className="border-b border-blue-400/10 px-5 py-4 sm:px-6">
                  <h3 className="text-sm font-semibold">Dados do consumo</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Valores registrados em cada mês do período.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-187.5 text-left">
                    <thead>
                      <tr className="border-b border-blue-400/10 bg-[#030d29]/70">
                        {[
                          "Mês",
                          "Consumo (L)",
                          "Consumo (m³)",
                          "Água",
                          "Esgoto",
                          "Total",
                        ].map((titulo) => (
                          <th
                            key={titulo}
                            className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500"
                          >
                            {titulo}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {dados.map((item) => (
                        <tr
                          key={`${item.ano}-${item.mes}`}
                          className="border-b border-blue-400/5 text-sm transition hover:bg-blue-500/5"
                        >
                          <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-200">
                            {nomesMeses[item.mes - 1]} de {item.ano}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-blue-300">
                            {Number(item.consumoLitros).toLocaleString(
                              "pt-BR",
                              { maximumFractionDigits: 3 },
                            )}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-slate-300">
                            {Number(item.consumoM3).toLocaleString("pt-BR", {
                              maximumFractionDigits: 6,
                            })}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-slate-300">
                            {Number(item.valorAgua).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-slate-300">
                            {Number(item.valorEsgoto).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 font-semibold text-emerald-300">
                            {Number(item.valorEstimado).toLocaleString(
                              "pt-BR",
                              {
                                style: "currency",
                                currency: "BRL",
                              },
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </section>
        )}

        {!carregando && !erro && dados.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-blue-400/15 bg-blue-950/10 px-5 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/10 bg-blue-500/10">
              <Droplets className="h-7 w-7 text-blue-400" />
            </div>

            <h2 className="mt-5 font-semibold text-slate-200">
              Nenhum relatório disponível
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Selecione um período e consulte para visualizar o consumo, o
              gráfico e os valores estimados.
            </p>
          </div>
        )}

        <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-blue-400/10 py-6 text-xs text-slate-500 sm:flex-row">
          <p>Monitoramento inteligente de água</p>
          <p>Projeto de TCC · 2026</p>
        </footer>
      </div>
    </main>
  );
}
