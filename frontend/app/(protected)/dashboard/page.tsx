"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import NotificacoesDashboard from "@/components/dashboard/NotificacoesDashboard";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Droplets,
  RefreshCw,
  TrendingUp,
  Waves,
} from "lucide-react";

type Medicao = {
  medicaoId: string;
  dataHora: string;
  vazao: number;
  volumeLitros: number;
};

type ResumoMensal = {
  consumoLitros: number;
  consumoM3: number;
  valorAgua: number;
  valorEsgoto: number;
  valorEstimado: number;
};

const API = "http://localhost:8080/api/medicoes";

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

function mesAtual() {
  const hoje = new Date();

  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(
    2,
    "0",
  )}`;
}

export default function DashboardPage() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [consumoHoje, setConsumoHoje] = useState(0);

  const [resumoMensal, setResumoMensal] = useState<ResumoMensal | null>(null);

  const [medicoes, setMedicoes] = useState<Medicao[]>([]);
  const [mesResumo, setMesResumo] = useState(mesAtual);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarDados = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    setCarregando(true);
    setErro(null);

    const [ano, mes] = mesResumo.split("-").map(Number);

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    try {
      const respostas = await Promise.all([
        fetch(`${API}/hoje`, { headers }),

        fetch(`${API}/resumo-mensal?ano=${ano}&mes=${mes}`, { headers }),

        fetch(API, { headers }),
      ]);

      if (respostas.some((resposta) => resposta.status === 401)) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (respostas.some((resposta) => !resposta.ok)) {
        throw new Error("Não foi possível carregar os dados.");
      }

      const [hoje, mensal, lista] = await Promise.all(
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

      setMedicoes(Array.isArray(lista) ? lista : []);
    } catch (error) {
      console.error("Erro ao carregar visão geral:", error);

      setErro(
        "Não foi possível carregar os dados. Verifique se o backend está funcionando.",
      );
    } finally {
      setCarregando(false);
    }
  }, [mesResumo, router]);

  useEffect(() => {
    function atualizarPerfil(event?: Event) {
      const evento = event as CustomEvent<{ nome?: string }> | undefined;

      setNome(
        (evento?.detail?.nome ?? localStorage.getItem("nome") ?? "").trim(),
      );
    }

    atualizarPerfil();

    window.addEventListener("perfilAtualizado", atualizarPerfil);

    return () => {
      window.removeEventListener("perfilAtualizado", atualizarPerfil);
    };
  }, []);

  useEffect(() => {
    void carregarDados();
  }, [carregarDados]);

  const vazaoMedia = useMemo(() => {
    if (medicoes.length === 0) return 0;

    return (
      medicoes.reduce((total, item) => total + Number(item.vazao ?? 0), 0) /
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

  return (
    <div id="inicio">
      <section className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-blue-400">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            Painel de controle
          </p>

          <h1 className="text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            Olá, {nome || "usuário"}
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Aqui está o resumo do consumo de água da sua residência.
          </p>

          <p className="mt-2 text-xs capitalize text-slate-500">{dataAtual}</p>
        </div>

        <button
          type="button"
          onClick={() => void carregarDados()}
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

      <div className="mb-6">
        <NotificacoesDashboard
          consumoHoje={carregando ? null : consumoHoje}
          consumoMes={carregando ? null : (resumoMensal?.consumoLitros ?? null)}
        />
      </div>

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
            {carregando ? "—" : `${numero(resumoMensal?.consumoLitros ?? 0)} L`}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Volume registrado no mês selecionado
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
            {carregando ? "—" : `${numero(resumoMensal?.consumoM3 ?? 0)} m³`}
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
                {carregando ? "—" : moeda(resumoMensal?.valorAgua ?? 0)}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-blue-400/10 pb-4">
              <span className="text-sm text-slate-400">Esgoto</span>

              <span className="font-medium">
                {carregando ? "—" : moeda(resumoMensal?.valorEsgoto ?? 0)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <span className="text-sm font-medium text-slate-300">
                Total estimado
              </span>

              <span className="text-xl font-bold text-blue-400">
                {carregando ? "—" : moeda(resumoMensal?.valorEstimado ?? 0)}
              </span>
            </div>
          </div>

          <p className="mt-5 rounded-xl border border-blue-400/10 bg-blue-500/5 p-3 text-xs leading-5 text-slate-400">
            O valor é uma estimativa calculada pelo sistema e pode diferir da
            fatura real da concessionária.
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

          {carregando ? (
            <div className="rounded-xl border border-blue-400/10 bg-blue-500/5 p-5 text-sm text-slate-400">
              Carregando medições...
            </div>
          ) : medicoes.length === 0 ? (
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
                    A vazão média das medições está acima do limite configurado
                    de 10 L/min. Verifique se esse padrão corresponde ao uso da
                    residência.
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
                    A vazão média está dentro do limite configurado. Isso não
                    descarta todos os tipos de vazamento.
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
              {carregando ? "—" : numero(vazaoMedia)} L/min
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
