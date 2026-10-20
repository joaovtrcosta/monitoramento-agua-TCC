"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Droplets,
  LogOut,
  RefreshCw,
  TrendingUp,
  Waves,
  Clock3,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  FileBarChart,
} from "lucide-react";
import { useRouter } from "next/navigation";

import Calendario from "@/components/shared/Calendario";

type Medicao = {
  medicaoId: string;
  dataHora: string;
  vazao: number;
  volumeLitros: number;
};

type ConsumoDiario = {
  data: string;
  consumoLitros: number;
};

type ResumoMensal = {
  consumoLitros: number;
  consumoM3: number;
  valorAgua: number;
  valorEsgoto: number;
  valorEstimado: number;
};

const API = "http://localhost:8080/api/medicoes";

export default function DashboardPage() {
  const router = useRouter();

  const [consumoHoje, setConsumoHoje] = useState(0);
  const [resumoMensal, setResumoMensal] = useState<ResumoMensal | null>(null);
  const [medicoes, setMedicoes] = useState<Medicao[]>([]);
  const [consumoDiario, setConsumoDiario] = useState<ConsumoDiario[]>([]);
  const [nome, setNome] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [dataSelecionada, setDataSelecionada] = useState("");
  const [medicoesFiltradas, setMedicoesFiltradas] = useState<Medicao[] | null>(
    null,
  );
  const [carregandoFiltro, setCarregandoFiltro] = useState(false);
  const [erroFiltro, setErroFiltro] = useState<string | null>(null);

  const [paginaAtual, setPaginaAtual] = useState(1);

  useEffect(() => {
    function atualizarPerfil(event?: Event) {
      const evento = event as CustomEvent<{ nome?: string }> | undefined;
      const nomeSalvo = evento?.detail?.nome ?? localStorage.getItem("nome");

      if (nomeSalvo) {
        setNome(nomeSalvo);
      }
    }

    atualizarPerfil();

    window.addEventListener("perfilAtualizado", atualizarPerfil);

    return () => {
      window.removeEventListener("perfilAtualizado", atualizarPerfil);
    };
  }, []);

  const MEDICOES_POR_PAGINA = 10;

  const obterToken = useCallback(() => {
    return localStorage.getItem("token");
  }, []);

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    const token = obterToken();

    if (!token) {
      router.push("/login");
      setCarregando(false);
      return;
    }

    try {
      const agora = new Date();
      const ano = agora.getFullYear();
      const mes = agora.getMonth() + 1;

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const respostas = await Promise.all([
        fetch(`${API}/hoje`, { headers }),
        fetch(`${API}/resumo-mensal?ano=${ano}&mes=${mes}`, {
          headers,
        }),
        fetch(API, { headers }),
        fetch(`${API}/consumo-diario?ano=${ano}&mes=${mes}`, {
          headers,
        }),
      ]);

      if (respostas.some((resposta) => !resposta.ok)) {
        if (respostas.some((resposta) => resposta.status === 401)) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        throw new Error("Não foi possível carregar os dados.");
      }

      const [hoje, mensal, lista, diario] = await Promise.all(
        respostas.map((resposta) => resposta.json()),
      );

      setConsumoHoje(Number(hoje ?? 0));

      setResumoMensal({
        consumoLitros: Number(mensal.consumoLitros ?? 0),
        consumoM3: Number(mensal.consumoM3 ?? 0),
        valorAgua: Number(mensal.valorAgua ?? 0),
        valorEsgoto: Number(mensal.valorEsgoto ?? 0),
        valorEstimado: Number(mensal.valorEstimado ?? 0),
      });

      setMedicoes(lista);

      setConsumoDiario(
        diario.map((item: ConsumoDiario) => ({
          data: item.data,
          consumoLitros: Number(item.consumoLitros ?? 0),
        })),
      );
    } catch (error) {
      console.error(error);
      setErro(
        "Não foi possível carregar os dados. Verifique se o backend está funcionando.",
      );
    } finally {
      setCarregando(false);
    }
  }, [obterToken, router]);

  const carregarConsumoDiario = useCallback(
    async (mes: string) => {
      const token = obterToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const [ano, numeroMes] = mes.split("-").map(Number);

      try {
        const resposta = await fetch(
          `${API}/consumo-diario?ano=${ano}&mes=${numeroMes}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (resposta.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        if (!resposta.ok) {
          throw new Error("Não foi possível carregar o consumo diário.");
        }

        const dados: ConsumoDiario[] = await resposta.json();

        setConsumoDiario(
          dados.map((item) => ({
            data: item.data,
            consumoLitros: Number(item.consumoLitros ?? 0),
          })),
        );
      } catch (error) {
        console.error("Erro ao carregar consumo diário:", error);
        setConsumoDiario([]);
      }
    },
    [obterToken, router],
  );

  async function filtrarPorData() {
    if (!dataSelecionada) {
      setErroFiltro("Selecione uma data para consultar.");
      return;
    }

    const token = obterToken();

    if (!token) {
      router.push("/login");
      return;
    }

    setCarregandoFiltro(true);
    setErroFiltro(null);

    try {
      const resposta = await fetch(`${API}/por-data?data=${dataSelecionada}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!resposta.ok) {
        if (resposta.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        throw new Error("Falha na consulta.");
      }

      const dados: Medicao[] = await resposta.json();

      setPaginaAtual(1);
      setMedicoesFiltradas(dados);
    } catch (error) {
      console.error(error);
      setErroFiltro("Não foi possível consultar as medições.");
    } finally {
      setCarregandoFiltro(false);
    }
  }

  function limparFiltro() {
    setDataSelecionada("");
    setMedicoesFiltradas(null);
    setErroFiltro(null);
    setPaginaAtual(1);
  }

  function sair() {
    localStorage.removeItem("token");
    localStorage.removeItem("nome");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    router.push("/login");
  }

  useEffect(() => {
    setNome(localStorage.getItem("nome")?.trim() ?? "");
    carregarDados();
  }, [carregarDados]);

  function numero(valor: number) {
    return valor.toLocaleString("pt-BR", {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
  }

  function moeda(valor: number) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function dataHora(valor: string) {
    const data = new Date(valor);

    if (Number.isNaN(data.getTime())) return valor;

    return data.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function dia(valor: string) {
    const partes = valor.split("-");
    return partes.length === 3 ? partes[2] : valor;
  }

  const medicoesRecentes = useMemo(
    () =>
      [...medicoes]
        .sort(
          (a, b) =>
            new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime(),
        )
        .slice(0, 5),
    [medicoes],
  );

  const medicoesExibidas =
    medicoesFiltradas !== null ? medicoesFiltradas : medicoesRecentes;

  const totalPaginas = Math.ceil(
    (medicoesFiltradas?.length ?? 0) / MEDICOES_POR_PAGINA,
  );

  const medicoesPaginadas = (medicoesFiltradas ?? []).slice(
    (paginaAtual - 1) * MEDICOES_POR_PAGINA,
    paginaAtual * MEDICOES_POR_PAGINA,
  );

  function irParaPaginaAnterior() {
    setPaginaAtual((pagina) => Math.max(1, pagina - 1));
  }

  function irParaProximaPagina() {
    setPaginaAtual((pagina) => Math.min(totalPaginas, pagina + 1));
  }

  const diarioOrdenado = useMemo(
    () =>
      [...consumoDiario].sort(
        (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime(),
      ),
    [consumoDiario],
  );

  const [mesSelecionado, setMesSelecionado] = useState(() => {
    const hoje = new Date();

    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(
      2,
      "0",
    )}`;
  });

  useEffect(() => {
    carregarConsumoDiario(mesSelecionado);
  }, [mesSelecionado, carregarConsumoDiario]);

  const [mesResumo, setMesResumo] = useState(() => {
    const hoje = new Date();

    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(
      2,
      "0",
    )}`;
  });

  function mudarMesResumo(diferenca: number) {
    const [ano, mes] = mesResumo.split("-").map(Number);

    const novaData = new Date(ano, mes - 1 + diferenca, 1);

    setMesResumo(
      `${novaData.getFullYear()}-${String(novaData.getMonth() + 1).padStart(
        2,
        "0",
      )}`,
    );
  }

  useEffect(() => {
    async function carregarResumo() {
      const token = obterToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const [ano, mes] = mesResumo.split("-").map(Number);

      try {
        const resposta = await fetch(
          `${API}/resumo-mensal?ano=${ano}&mes=${mes}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (resposta.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        if (!resposta.ok) {
          throw new Error("Não foi possível carregar o resumo mensal.");
        }

        const dados = await resposta.json();

        setResumoMensal({
          consumoLitros: Number(dados.consumoLitros ?? 0),
          consumoM3: Number(dados.consumoM3 ?? 0),
          valorAgua: Number(dados.valorAgua ?? 0),
          valorEsgoto: Number(dados.valorEsgoto ?? 0),
          valorEstimado: Number(dados.valorEstimado ?? 0),
        });
      } catch (error) {
        console.error("Erro ao carregar resumo mensal:", error);
      }
    }

    carregarResumo();
  }, [mesResumo, obterToken, router]);

  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);

  const [anoMesSelecionado, mesNumeroSelecionado] = mesSelecionado
    .split("-")
    .map(Number);

  const nomeMes = new Date(
    anoMesSelecionado,
    mesNumeroSelecionado - 1,
    1,
  ).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  const diarioDoMes = diarioOrdenado.filter(
    (item) => item.data.slice(0, 7) === mesSelecionado,
  );

  const maiorConsumoMes = Math.max(
    0,
    ...diarioDoMes.map((item) => item.consumoLitros),
  );

  function mudarMes(diferenca: number) {
    const novaData = new Date(
      anoMesSelecionado,
      mesNumeroSelecionado - 1 + diferenca,
      1,
    );

    setMesSelecionado(
      `${novaData.getFullYear()}-${String(novaData.getMonth() + 1).padStart(
        2,
        "0",
      )}`,
    );

    setDiaSelecionado(null);
  }

  const maiorConsumo = useMemo(
    () => Math.max(0, ...diarioOrdenado.map((item) => item.consumoLitros)),
    [diarioOrdenado],
  );

  const vazaoMedia = useMemo(() => {
    if (medicoes.length === 0) return 0;

    return (
      medicoes.reduce((total, item) => total + Number(item.vazao), 0) /
      medicoes.length
    );
  }, [medicoes]);

  const possivelAnomalia = vazaoMedia > 10;

  const dataAtual = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const card =
    "rounded-2xl border border-blue-400/10 bg-blue-950/20 p-5 transition-all duration-300 hover:border-blue-400/25";

  const painel =
    "rounded-2xl border border-blue-400/10 bg-blue-950/20 p-5 sm:p-6";

  return (
    <main className="min-h-screen bg-[#020b24] text-white">
      {/* Menu lateral */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-blue-400/10 bg-[#030d29] lg:flex">

        <div className="flex h-20 items-center gap-3 border-b border-blue-400/10 px-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10">
            <Droplets className="h-6 w-6 text-blue-400" />
          </div>

          <div>
            <p className="text-[11px] font-semibold text-white">
              Monitoramento de Água
            </p>
          </div>
        </div>

        {/* Menu principal */}
        <div className="px-4 pt-8">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Menu principal
          </p>

          <a
            href="#inicio"
            className="flex items-center gap-3 rounded-xl border border-blue-400/15 bg-blue-500/10 px-3 py-3 text-sm font-medium text-blue-400"
          >
            <Activity className="h-4 w-4" />
            Visão geral
          </a>

          <a
            href="#grafico"
            className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-blue-500/10 hover:text-blue-300"
          >
            <BarChart3 className="h-4 w-4" />
            Consumo diário
          </a>

          <a
            href="#historico"
            className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-blue-500/10 hover:text-blue-300"
          >
            <CalendarDays className="h-4 w-4" />
            Histórico
          </a>

          <a
            href="/relatorios"
            className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-blue-500/10 hover:text-blue-300"
          >
            <FileBarChart className="h-4 w-4" />
            Relatórios
          </a>
        </div>

        <div className="mt-auto border-t border-blue-400/10 p-4">
          <button
            onClick={sair}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            Sair da conta
          </button>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-blue-400/10 bg-[#030d29]/90 backdrop-blur-xl">
          <div className="flex min-h-20 items-center justify-between gap-4 px-5 sm:px-8">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10">
                <Droplets className="h-5 w-5 text-blue-400" />
              </div>
              <span className="text-sm font-semibold">
                Monitoramento de Água
              </span>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold uppercase">
                  {nome || "Usuário"}
                </p>

                <a
                  href="/dashboard/perfil"
                  className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-blue-400 transition hover:text-blue-300"
                >
                  Meu perfil
                </a>
              </div>

              <a
                href="/perfil"
                aria-label="Acessar meu perfil"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-400/20 bg-blue-500/10 font-semibold text-blue-400 transition hover:border-blue-400/50 hover:bg-blue-500/20"
              >
                {(nome || "U").charAt(0).toUpperCase()}
              </a>

              <button
                onClick={sair}
                aria-label="Sair"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/10 text-slate-400 transition hover:border-red-400/30 hover:text-red-400 lg:hidden"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <div id="inicio" className="mx-auto max-w-375 p-5 sm:p-8">
          <section className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-blue-400">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                Painel de controle
              </p>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl uppercase">
                Olá, {nome || "usuário"}
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Aqui está o resumo do consumo de água da sua residência.
              </p>

              <p className="mt-2 text-xs capitalize text-slate-500">
                {dataAtual}
              </p>
            </div>

            <button
              onClick={carregarDados}
              disabled={carregando}
              className="flex w-fit items-center gap-2 rounded-xl border border-blue-400/20 bg-blue-500/5 px-4 py-3 text-sm text-slate-300 transition hover:border-blue-400/40 hover:bg-blue-500/10 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${carregando ? "animate-spin" : ""}`}
              />
              Atualizar dados
            </button>
          </section>

          {erro && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              {erro}
            </div>
          )}

          <section className="relative mb-6 overflow-hidden rounded-3xl border border-blue-400/20 bg-linear-to-br from-[#0b2850] via-[#082044] to-[#030d29] p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border border-blue-400/10" />
            <div className="pointer-events-none absolute right-0 top-10 h-40 w-40 rounded-full border border-blue-400/10" />

            <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-blue-300">
                  <Droplets className="h-4 w-4" />
                  Consumo de hoje
                </div>

                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-5xl font-bold tracking-tight sm:text-6xl">
                    {carregando ? "—" : numero(consumoHoje)}
                  </span>
                  <span className="text-lg text-blue-200/70">litros</span>
                </div>

                <p className="mt-4 max-w-lg text-sm leading-6 text-slate-300">
                  Acompanhe o volume de água registrado hoje.
                </p>
              </div>

              <div className="flex h-28 w-28 items-center justify-center rounded-3xl border border-blue-400/20 bg-blue-500/10 md:h-36 md:w-36">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10 md:h-24 md:w-24">
                  <Waves className="h-11 w-11 text-blue-400" />
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className={card}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Consumo mensal</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <CalendarDays className="h-5 w-5" />
                </div>
              </div>

              <p className="mt-5 text-2xl font-bold">
                {carregando
                  ? "—"
                  : `${numero(resumoMensal?.consumoLitros ?? 0)} L`}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Volume registrado neste mês
              </p>
            </div>

            <div className={card}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  Volume em metros cúbicos
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                  <BarChart3 className="h-5 w-5" />
                </div>
              </div>

              <p className="mt-5 text-2xl font-bold">
                {carregando
                  ? "—"
                  : `${numero(resumoMensal?.consumoM3 ?? 0)} m³`}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Equivalência do consumo mensal
              </p>
            </div>

            <div className={`${card} sm:col-span-2 xl:col-span-1`}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Conta estimada</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>

              <p className="mt-5 text-2xl font-bold">
                {carregando ? "—" : moeda(resumoMensal?.valorEstimado ?? 0)}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Estimativa de água e esgoto
              </p>
            </div>
          </section>

          <section className="mt-6 grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
            <div className={painel}>
              <div className="mb-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <Activity className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="font-semibold">Resumo da conta</h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Valores estimados do mês selecionado
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-xl border border-blue-400/10 bg-blue-500/5 p-2">
                  <button
                    type="button"
                    onClick={() => mudarMesResumo(-1)}
                    aria-label="Mês anterior do resumo"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-400/20 transition hover:bg-blue-500/10"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <span className="text-sm font-medium capitalize">
                    {new Date(
                      Number(mesResumo.split("-")[0]),
                      Number(mesResumo.split("-")[1]) - 1,
                      1,
                    ).toLocaleDateString("pt-BR", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>

                  <button
                    type="button"
                    onClick={() => mudarMesResumo(1)}
                    aria-label="Próximo mês do resumo"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-400/20 transition hover:bg-blue-500/10"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 border-b border-blue-400/10 pb-4">
                  <span className="text-sm text-slate-400">
                    Abastecimento de água
                  </span>
                  <span className="font-medium">
                    {moeda(resumoMensal?.valorAgua ?? 0)}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-blue-400/10 pb-4">
                  <span className="text-sm text-slate-400">Esgoto</span>
                  <span className="font-medium">
                    {moeda(resumoMensal?.valorEsgoto ?? 0)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <span className="text-sm font-medium text-slate-300">
                    Total estimado
                  </span>
                  <span className="text-xl font-bold text-blue-400">
                    {moeda(resumoMensal?.valorEstimado ?? 0)}
                  </span>
                </div>
              </div>

              <p className="mt-5 rounded-xl border border-blue-400/10 bg-blue-500/5 p-3 text-xs leading-5 text-slate-400">
                O valor é uma estimativa calculada pelo sistema e pode diferir
                da fatura real da concessionária.
              </p>
            </div>

            <div className={painel}>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <Activity className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-semibold">Status do consumo</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Análise das medições disponíveis
                  </p>
                </div>
              </div>

              {medicoes.length === 0 ? (
                <div className="rounded-xl border border-blue-400/10 bg-blue-500/5 p-5">
                  <p className="text-sm text-slate-300">Aguardando medições</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Ainda não há registros suficientes para avaliar o consumo.
                  </p>
                </div>
              ) : possivelAnomalia ? (
                <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" />
                    <div>
                      <p className="font-medium text-yellow-300">
                        Atenção à vazão média
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        A vazão média das medições está acima do limite
                        configurado de 10 L/min. Verifique se esse padrão
                        corresponde ao uso da residência.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                    <div>
                      <p className="font-medium text-emerald-300">
                        Sem alerta pelo limite configurado
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        A vazão média está dentro do limite configurado. Isso
                        não descarta todos os tipos de vazamento.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-blue-400/10 bg-blue-500/5 px-4 py-3">
                <span className="text-sm text-slate-400">
                  Vazão média registrada
                </span>
                <span className="font-semibold text-blue-300">
                  {numero(vazaoMedia)} L/min
                </span>
              </div>
            </div>
          </section>

          <section id="grafico" className={`${painel} mt-6`}>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <BarChart3 className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-semibold">Consumo ao longo do mês</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Clique em um dia para consultar o consumo por hora
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => mudarMes(-1)}
                  aria-label="Mês anterior"
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-blue-400/20 hover:bg-blue-500/10"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <span className="min-w-36 text-center text-sm font-medium capitalize">
                  {nomeMes}
                </span>

                <button
                  type="button"
                  onClick={() => mudarMes(1)}
                  aria-label="Próximo mês"
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-blue-400/20 hover:bg-blue-500/10"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            {carregando ? (
              <div className="flex h-64 items-center justify-center text-sm text-slate-400">
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Carregando gráfico...
              </div>
            ) : diarioDoMes.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-blue-400/10 bg-blue-500/5 text-center">
                <BarChart3 className="h-8 w-8 text-slate-500" />
                <p className="mt-3 text-sm text-slate-400">
                  Não existem registros para este mês.
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-xl border border-blue-400/10 bg-[#030d29]/70 p-4 sm:p-6">
                  <div className="flex h-64 gap-3 sm:gap-5">
                    <div className="flex w-14 shrink-0 flex-col justify-between pb-8 text-right text-[10px] text-slate-500">
                      <span>{numero(maiorConsumoMes)} L</span>
                      <span>{numero(maiorConsumoMes * 0.75)} L</span>
                      <span>{numero(maiorConsumoMes * 0.5)} L</span>
                      <span>{numero(maiorConsumoMes * 0.25)} L</span>
                      <span>0 L</span>
                    </div>

                    <div className="relative flex flex-1 items-end gap-2 overflow-x-auto border-b border-l border-blue-400/10 px-3 pb-8 sm:gap-3 sm:px-4">
                      {diarioDoMes.map((item) => {
                        const porcentagem =
                          maiorConsumoMes > 0
                            ? (item.consumoLitros / maiorConsumoMes) * 100
                            : 0;

                        const selecionado = diaSelecionado === item.data;

                        return (
                          <button
                            type="button"
                            key={item.data}
                            onClick={() =>
                              setDiaSelecionado(selecionado ? null : item.data)
                            }
                            title={`${dia(item.data)}: ${numero(item.consumoLitros)} L`}
                            className="group flex h-full min-w-9 flex-1 cursor-pointer flex-col items-center justify-end sm:min-w-12"
                          >
                            <span className="mb-2 whitespace-nowrap text-[10px] text-blue-300 opacity-0 transition group-hover:opacity-100">
                              {numero(item.consumoLitros)} L
                            </span>

                            <div
                              className={`w-full max-w-8 rounded-t-md transition-all duration-300 ${
                                selecionado
                                  ? "bg-cyan-300"
                                  : "bg-linear-to-t from-blue-700 to-blue-400 group-hover:brightness-125"
                              }`}
                              style={{
                                height: `${Math.max(porcentagem, 3)}%`,
                              }}
                            />

                            <span
                              className={`mt-3 text-[10px] ${
                                selecionado
                                  ? "font-bold text-cyan-300"
                                  : "text-slate-500"
                              }`}
                            >
                              {dia(item.data)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                    <span className="h-2 w-2 rounded-sm bg-blue-400" />
                    Consumo em litros
                  </div>
                </div>

                {diaSelecionado && (
                  <div className="mt-5 rounded-xl border border-blue-400/10 bg-[#030d29]/70 p-4 sm:p-6">
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">Consumo por hora</h3>
                        <p className="mt-1 text-xs text-slate-400">
                          Dia {diaSelecionado.split("-").reverse().join("/")}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setDiaSelecionado(null)}
                        aria-label="Fechar gráfico por hora"
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-blue-400/20 hover:bg-blue-500/10"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <GraficoConsumoPorHora
                      medicoes={medicoes}
                      dataSelecionada={diaSelecionado}
                    />
                  </div>
                )}
              </>
            )}
          </section>

          <section id="historico" className={`${painel} mt-6`}>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <Clock3 className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-semibold">
                    {medicoesFiltradas !== null
                      ? "Resultado da consulta"
                      : "Histórico de medições"}
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    {medicoesFiltradas !== null
                      ? `Data: ${dataSelecionada.split("-").reverse().join("/")}`
                      : "Consulte os registros do seu dispositivo"}
                  </p>
                </div>
              </div>

              <span className="w-fit rounded-lg border border-blue-400/10 bg-blue-500/5 px-3 py-2 text-xs text-blue-300">
                {medicoesFiltradas !== null
                  ? `${medicoesFiltradas.length} resultados`
                  : `${medicoes.length} registros no total`}
              </span>
            </div>

            <div className="mb-5 flex flex-wrap items-center gap-3">
              <Calendario
                value={dataSelecionada}
                onChange={(data) => {
                  setDataSelecionada(data);
                  setPaginaAtual(1);
                }}
                onConsultar={() => {
                  setPaginaAtual(1);
                  filtrarPorData();
                }}
                carregando={carregandoFiltro}
              />

              {medicoesFiltradas !== null && (
                <button
                  type="button"
                  onClick={limparFiltro}
                  disabled={carregandoFiltro}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-blue-400/20 px-4 text-sm text-slate-300 transition hover:bg-blue-500/10 disabled:opacity-50 cursor-pointer"
                >
                  <X className="h-4 w-4 " />
                  Limpar
                </button>
              )}
            </div>

            {erroFiltro && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {erroFiltro}
              </div>
            )}

            {medicoesExibidas.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-blue-400/15 py-12 text-center">
                <Droplets className="h-8 w-8 text-slate-500" />

                <p className="mt-3 text-sm font-medium text-slate-300">
                  Nenhuma medição encontrada
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {medicoesFiltradas !== null
                    ? "Não há registros para a data selecionada."
                    : "Os registros aparecerão aqui quando estiverem disponíveis."}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-162.5 text-left">
                    <thead>
                      <tr className="border-b border-blue-400/10">
                        <th className="pb-4 pr-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                          Data e hora
                        </th>

                        <th className="pb-4 pr-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                          Vazão
                        </th>

                        <th className="pb-4 pr-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                          Volume
                        </th>

                        <th className="pb-4 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                          Identificador
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {(medicoesFiltradas !== null
                        ? medicoesPaginadas
                        : medicoesExibidas
                      ).map((medicao) => (
                        <tr
                          key={medicao.medicaoId}
                          className="border-b border-blue-400/5 transition hover:bg-blue-500/5"
                        >
                          <td className="py-4 pr-4 text-sm text-slate-300">
                            {dataHora(medicao.dataHora)}
                          </td>

                          <td className="py-4 pr-4 text-sm text-slate-300">
                            {numero(Number(medicao.vazao))}{" "}
                            <span className="text-xs text-slate-500">
                              L/min
                            </span>
                          </td>

                          <td className="py-4 pr-4 text-sm font-medium text-blue-300">
                            {numero(Number(medicao.volumeLitros))}{" "}
                            <span className="text-xs text-slate-500">L</span>
                          </td>

                          <td
                            className="max-w-44 truncate py-4 text-right text-xs text-slate-500"
                            title={medicao.medicaoId}
                          >
                            {medicao.medicaoId}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {medicoesFiltradas !== null &&
                  medicoesFiltradas.length > 10 && (
                    <div className="mt-5 flex flex-col gap-3 border-t border-blue-400/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-slate-500">
                        Página {paginaAtual} de {totalPaginas}
                        {" · "}
                        {medicoesFiltradas.length} medições
                      </p>

                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={irParaPaginaAnterior}
                          disabled={paginaAtual === 1}
                          aria-label="Página anterior"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-400/20 text-slate-300 transition hover:bg-blue-500/10 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <ChevronLeft className="h-4 w-4 cursor-pointer" />
                        </button>

                        <span className="min-w-9 text-center text-sm font-medium text-white">
                          {paginaAtual}
                        </span>

                        <button
                          type="button"
                          onClick={irParaProximaPagina}
                          disabled={paginaAtual === totalPaginas}
                          aria-label="Próxima página"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-400/20 text-slate-300 transition hover:bg-blue-500/10 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <ChevronRight className="h-4 w-4 cursor-pointer" />
                        </button>
                      </div>
                    </div>
                  )}
              </>
            )}

            {medicoesFiltradas === null &&
              medicoes.length > medicoesRecentes.length && (
                <p className="mt-4 text-xs text-slate-500">
                  Mostrando as 5 medições mais recentes. Use o filtro para
                  consultar um dia específico.
                </p>
              )}
          </section>

          <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-blue-400/10 py-6 text-xs text-slate-500 sm:flex-row">
            <p>Monitoramento inteligente de água</p>
            <p>Projeto de TCC · 2026</p>
          </footer>
        </div>
      </div>
    </main>
  );
}

type GraficoPorHoraProps = {
  medicoes: Medicao[];
  dataSelecionada: string;
};

function GraficoConsumoPorHora({
  medicoes,
  dataSelecionada,
}: GraficoPorHoraProps) {
  const consumosPorHora = Array(24).fill(0) as number[];

  medicoes.forEach((medicao) => {
    const data = new Date(medicao.dataHora);

    if (Number.isNaN(data.getTime())) return;

    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
    const dataMedicao = `${ano}-${mes}-${dia}`;

    if (dataMedicao !== dataSelecionada) return;

    const hora = data.getHours();
    consumosPorHora[hora] += Number(medicao.volumeLitros) || 0;
  });

  const maiorValor = Math.max(...consumosPorHora, 0);
  const pontos = consumosPorHora
    .map((valor, hora) => {
      const x = 40 + (hora / 23) * 500;
      const y = 160 - (maiorValor > 0 ? (valor / maiorValor) * 130 : 0);

      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="text-sm text-slate-400">
          Volume registrado por hora
        </span>
        <span className="text-sm font-semibold text-cyan-300">
          {consumosPorHora
            .reduce((total, valor) => total + valor, 0)
            .toLocaleString("pt-BR", {
              maximumFractionDigits: 3,
            })}{" "}
          L
        </span>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox="0 0 580 205"
          className="h-56 min-w-130 w-full"
          role="img"
          aria-label="Gráfico de consumo por hora"
        >
          {[0, 1, 2, 3].map((linha) => (
            <line
              key={linha}
              x1="40"
              x2="540"
              y1={30 + linha * 43}
              y2={30 + linha * 43}
              stroke="rgba(148,163,184,0.15)"
              strokeDasharray="4 4"
            />
          ))}

          <polyline
            points={pontos}
            fill="none"
            stroke="#22d3ee"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {consumosPorHora.map((valor, hora) => {
            const x = 40 + (hora / 23) * 500;
            const y = 160 - (maiorValor > 0 ? (valor / maiorValor) * 130 : 0);

            return (
              <g key={hora}>
                <circle cx={x} cy={y} r="3.5" fill="#22d3ee">
                  <title>
                    {String(hora).padStart(2, "0")}:00 —{" "}
                    {valor.toLocaleString("pt-BR")} L
                  </title>
                </circle>

                {hora % 3 === 0 && (
                  <text
                    x={x}
                    y="190"
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="10"
                  >
                    {String(hora).padStart(2, "0")}h
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        Passe o cursor sobre os pontos para consultar os valores.
      </p>
    </div>
  );
}
