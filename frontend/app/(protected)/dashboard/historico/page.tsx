"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Droplets,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

type Medicao = {
  medicaoId: string;
  dataHora: string;
  vazao: number;
  volumeLitros: number;
};

const API = "http://localhost:8080/api/medicoes";

const ITENS_POR_PAGINA = 10;

function formatarNumero(valor: number) {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function obterDataMedicao(dataHora: string) {
  const correspondencia = dataHora.match(/^\d{4}-\d{2}-\d{2}/);

  if (correspondencia) return correspondencia[0];

  const data = new Date(dataHora);

  if (Number.isNaN(data.getTime())) return "";

  return [
    data.getFullYear(),
    String(data.getMonth() + 1).padStart(2, "0"),
    String(data.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatarData(dataHora: string) {
  const data = obterDataMedicao(dataHora);

  if (!data) return "—";

  const [ano, mes, dia] = data.split("-");

  return `${dia}/${mes}/${ano}`;
}

function formatarHorario(dataHora: string) {
  const horario = dataHora.match(/T(\d{2}:\d{2})(?::\d{2})?/);

  if (horario) return horario[1];

  const data = new Date(dataHora);

  if (Number.isNaN(data.getTime())) return "—";

  return data.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoricoPage() {
  const router = useRouter();

  const [medicoes, setMedicoes] = useState<Medicao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [pesquisa, setPesquisa] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);

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
        throw new Error("Não foi possível buscar o histórico.");
      }

      const dados: Medicao[] = await resposta.json();

      setMedicoes(Array.isArray(dados) ? dados : []);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);

      setErro("Não foi possível carregar o histórico de medições.");
    } finally {
      setCarregando(false);
    }
  }, [router]);

  useEffect(() => {
    void carregarMedicoes();
  }, [carregarMedicoes]);

  const medicoesFiltradas = useMemo(() => {
    const termo = pesquisa.trim().toLowerCase();

    return medicoes
      .filter((medicao) => {
        const data = obterDataMedicao(medicao.dataHora);

        if (dataInicio && data < dataInicio) {
          return false;
        }

        if (dataFim && data > dataFim) {
          return false;
        }

        if (!termo) return true;

        const conteudo = [
          formatarData(medicao.dataHora),
          formatarHorario(medicao.dataHora),
          formatarNumero(Number(medicao.vazao ?? 0)),
          formatarNumero(Number(medicao.volumeLitros ?? 0)),
          medicao.medicaoId ?? "",
        ]
          .join(" ")
          .toLowerCase();

        return conteudo.includes(termo);
      })
      .sort((a, b) => {
        return new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime();
      });
  }, [medicoes, pesquisa, dataInicio, dataFim]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(medicoesFiltradas.length / ITENS_POR_PAGINA),
  );

  const paginaSegura = Math.min(paginaAtual, totalPaginas);

  const medicoesPaginadas = useMemo(() => {
    const inicio = (paginaSegura - 1) * ITENS_POR_PAGINA;

    return medicoesFiltradas.slice(inicio, inicio + ITENS_POR_PAGINA);
  }, [medicoesFiltradas, paginaSegura]);

  const estatisticas = useMemo(() => {
    const volumeTotal = medicoesFiltradas.reduce(
      (total, medicao) => total + Number(medicao.volumeLitros ?? 0),
      0,
    );

    const vazaoMedia =
      medicoesFiltradas.length > 0
        ? medicoesFiltradas.reduce(
            (total, medicao) => total + Number(medicao.vazao ?? 0),
            0,
          ) / medicoesFiltradas.length
        : 0;

    return {
      total: medicoesFiltradas.length,
      volumeTotal,
      vazaoMedia,
    };
  }, [medicoesFiltradas]);

  function limparFiltros() {
    setPesquisa("");
    setDataInicio("");
    setDataFim("");
    setPaginaAtual(1);
  }

  const filtrosAtivos = Boolean(pesquisa || dataInicio || dataFim);

  const painel =
    "rounded-2xl border border-blue-400/10 bg-blue-950/20 p-5 sm:p-6";

  const card = "rounded-2xl border border-blue-400/10 bg-blue-950/20 p-5";

  const input =
    "w-full rounded-xl border border-blue-400/15 bg-[#071633] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400/50";

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
            Monitoramento
          </p>

          <h1 className="text-3xl font-bold">Histórico de medições</h1>

          <p className="mt-2 text-sm text-slate-400">
            Consulte os registros de consumo e vazão coletados pelo sistema.
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
          Atualizar registros
        </button>
      </section>

      {erro && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          {erro}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className={card}>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Total de medições</p>

            <Activity className="h-5 w-5 text-blue-400" />
          </div>

          <p className="mt-5 text-2xl font-bold">
            {carregando ? "—" : estatisticas.total.toLocaleString("pt-BR")}
          </p>

          <p className="mt-2 text-xs text-slate-500">Registros encontrados</p>
        </div>

        <div className={card}>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Volume registrado</p>

            <Droplets className="h-5 w-5 text-cyan-400" />
          </div>

          <p className="mt-5 text-2xl font-bold">
            {carregando ? "—" : `${formatarNumero(estatisticas.volumeTotal)} L`}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Soma do volume das medições filtradas
          </p>
        </div>

        <div className={`${card} sm:col-span-2 xl:col-span-1`}>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Vazão média</p>

            <Clock3 className="h-5 w-5 text-indigo-400" />
          </div>

          <p className="mt-5 text-2xl font-bold">
            {carregando
              ? "—"
              : `${formatarNumero(estatisticas.vazaoMedia)} L/min`}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Média das leituras filtradas
          </p>
        </div>
      </section>

      <section className={painel}>
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-blue-500/10 p-3">
            <Search className="h-5 w-5 text-blue-400" />
          </div>

          <div>
            <h2 className="font-semibold">Filtrar medições</h2>

            <p className="mt-1 text-xs text-slate-500">
              Pesquise registros por data, horário ou valores.
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <label
              htmlFor="pesquisa-historico"
              className="mb-2 block text-xs font-medium text-slate-400"
            >
              Pesquisar
            </label>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

              <input
                id="pesquisa-historico"
                type="text"
                value={pesquisa}
                onChange={(evento) => {
                  setPesquisa(evento.target.value);
                  setPaginaAtual(1);
                }}
                placeholder="Data, horário ou valor..."
                className={`${input} pl-10`}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="data-inicio"
              className="mb-2 block text-xs font-medium text-slate-400"
            >
              Data inicial
            </label>

            <input
              id="data-inicio"
              type="date"
              value={dataInicio}
              onChange={(evento) => {
                setDataInicio(evento.target.value);
                setPaginaAtual(1);
              }}
              className={input}
            />
          </div>

          <div>
            <label
              htmlFor="data-fim"
              className="mb-2 block text-xs font-medium text-slate-400"
            >
              Data final
            </label>

            <input
              id="data-fim"
              type="date"
              value={dataFim}
              min={dataInicio || undefined}
              onChange={(evento) => {
                setDataFim(evento.target.value);
                setPaginaAtual(1);
              }}
              className={input}
            />
          </div>
        </div>

        {filtrosAtivos && (
          <button
            type="button"
            onClick={limparFiltros}
            className="mt-4 flex items-center gap-2 text-sm text-blue-400 transition hover:text-blue-300"
          >
            <X className="h-4 w-4" />
            Limpar filtros
          </button>
        )}
      </section>

      <section className={painel}>
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-500/10 p-3">
              <CalendarDays className="h-5 w-5 text-blue-400" />
            </div>

            <div>
              <h2 className="font-semibold">Registros de medições</h2>

              <p className="mt-1 text-xs text-slate-500">
                Ordenados do mais recente para o mais antigo
              </p>
            </div>
          </div>

          <span className="w-fit rounded-lg border border-blue-400/15 bg-blue-500/10 px-3 py-2 text-xs text-blue-300">
            {medicoesFiltradas.length} registros
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-blue-400/10">
          <table className="w-full min-w-162.5 text-left text-sm">
            <thead className="bg-[#0b1d3d] text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-4 font-medium">Data</th>

                <th className="px-5 py-4 font-medium">Horário</th>

                <th className="px-5 py-4 font-medium">Vazão</th>

                <th className="px-5 py-4 font-medium">Volume</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-blue-400/10">
              {carregando ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-14 text-center text-slate-400"
                  >
                    Carregando medições...
                  </td>
                </tr>
              ) : medicoesPaginadas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-14 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Droplets className="h-8 w-8 text-slate-600" />

                      <p className="text-sm text-slate-400">
                        Nenhuma medição encontrada.
                      </p>

                      {filtrosAtivos && (
                        <button
                          type="button"
                          onClick={limparFiltros}
                          className="text-sm text-blue-400 hover:underline"
                        >
                          Limpar filtros
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                medicoesPaginadas.map((medicao) => (
                  <tr
                    key={medicao.medicaoId}
                    className="transition hover:bg-blue-500/5"
                  >
                    <td className="px-5 py-4 font-medium text-slate-200">
                      {formatarData(medicao.dataHora)}
                    </td>

                    <td className="px-5 py-4 text-slate-400">
                      {formatarHorario(medicao.dataHora)}
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-lg border border-indigo-400/15 bg-indigo-500/10 px-3 py-1.5 text-indigo-300">
                        {formatarNumero(Number(medicao.vazao ?? 0))} L/min
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-lg border border-blue-400/15 bg-blue-500/10 px-3 py-1.5 font-medium text-blue-300">
                        {formatarNumero(Number(medicao.volumeLitros ?? 0))} L
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!carregando && medicoesFiltradas.length > 0 && (
          <div className="mt-5 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-slate-500">
              Exibindo {(paginaSegura - 1) * ITENS_POR_PAGINA + 1} a{" "}
              {Math.min(
                paginaSegura * ITENS_POR_PAGINA,
                medicoesFiltradas.length,
              )}{" "}
              de {medicoesFiltradas.length} registros
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setPaginaAtual((atual) => Math.max(1, atual - 1))
                }
                disabled={paginaSegura === 1}
                aria-label="Página anterior"
                className="rounded-xl border border-blue-400/15 p-2.5 transition hover:bg-blue-500/10 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="text-sm text-slate-400">
                Página{" "}
                <span className="font-semibold text-white">{paginaSegura}</span>{" "}
                de {totalPaginas}
              </span>

              <button
                type="button"
                onClick={() =>
                  setPaginaAtual((atual) => Math.min(totalPaginas, atual + 1))
                }
                disabled={paginaSegura === totalPaginas}
                aria-label="Próxima página"
                className="rounded-xl border border-blue-400/15 p-2.5 transition hover:bg-blue-500/10 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
