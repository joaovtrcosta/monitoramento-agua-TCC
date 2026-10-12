"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CalendarDays,
  Droplets,
  LogOut,
  RefreshCw,
  TrendingUp,
  Waves,
} from "lucide-react";
import { useRouter } from "next/navigation";

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

export default function DashboardPage() {
  const router = useRouter();

  const [consumoHoje, setConsumoHoje] = useState<number | null>(null);

  const [resumoMensal, setResumoMensal] =
    useState<ResumoMensal | null>(null);

  const [medicoes, setMedicoes] = useState<Medicao[]>([]);

  const [consumoDiario, setConsumoDiario] =
    useState<ConsumoDiario[]>([]);

  const [nome, setNome] = useState("");

  const [carregando, setCarregando] = useState(true);

  const [erro, setErro] = useState<string | null>(null);

  async function carregarDados() {
    setCarregando(true);
    setErro(null);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const agora = new Date();

      const ano = agora.getFullYear();
      const mes = agora.getMonth() + 1;

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const [
        resHoje,
        resMensal,
        resMedicoes,
        resConsumoDiario,
      ] = await Promise.all([
        fetch(
          "http://localhost:8080/api/medicoes/hoje",
          {
            method: "GET",
            headers,
          }
        ),

        fetch(
          `http://localhost:8080/api/medicoes/resumo-mensal?ano=${ano}&mes=${mes}`,
          {
            method: "GET",
            headers,
          }
        ),

        fetch(
          "http://localhost:8080/api/medicoes",
          {
            method: "GET",
            headers,
          }
        ),

        fetch(
          `http://localhost:8080/api/medicoes/consumo-diario?ano=${ano}&mes=${mes}`,
          {
            method: "GET",
            headers,
          }
        ),
      ]);

      if (
        !resHoje.ok ||
        !resMensal.ok ||
        !resMedicoes.ok ||
        !resConsumoDiario.ok
      ) {
        throw new Error(
          "Não foi possível carregar os dados."
        );
      }

      const hoje = await resHoje.json();
      const mensal = await resMensal.json();
      const lista = await resMedicoes.json();
      const diario = await resConsumoDiario.json();

      setConsumoHoje(Number(hoje));

      setResumoMensal({
        consumoLitros: Number(
          mensal.consumoLitros ?? 0
        ),
        consumoM3: Number(
          mensal.consumoM3 ?? 0
        ),
        valorAgua: Number(
          mensal.valorAgua ?? 0
        ),
        valorEsgoto: Number(
          mensal.valorEsgoto ?? 0
        ),
        valorEstimado: Number(
          mensal.valorEstimado ?? 0
        ),
      });

      setMedicoes(lista);

      setConsumoDiario(
        diario.map(
          (item: ConsumoDiario) => ({
            data: item.data,
            consumoLitros: Number(
              item.consumoLitros ?? 0
            ),
          })
        )
      );

    } catch (error) {
      console.error(
        "Erro ao carregar dashboard:",
        error
      );

      setErro(
        "Não foi possível carregar os dados do dashboard."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    const nomeUsuario =
      localStorage.getItem("nome");

    if (nomeUsuario) {
      setNome(nomeUsuario.trim());
    }

    carregarDados();
  }, []);

  function sair() {
    localStorage.removeItem("token");
    localStorage.removeItem("nome");
    localStorage.removeItem("email");
    localStorage.removeItem("role");

    router.push("/login");
  }

  function formatarNumero(valor: number) {
    return valor.toLocaleString("pt-BR", {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
  }

  function formatarMoeda(valor: number) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatarData(data: string) {
    return new Date(data).toLocaleString(
      "pt-BR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  function formatarDia(data: string) {
    const partes = data.split("-");

    if (partes.length !== 3) {
      return data;
    }

    return partes[2];
  }

  const medicoesRecentes = useMemo(() => {
    return [...medicoes]
      .sort(
        (a, b) =>
          new Date(b.dataHora).getTime() -
          new Date(a.dataHora).getTime()
      )
      .slice(0, 5);
  }, [medicoes]);

  
  const consumoDiarioOrdenado = useMemo(() => {
    return [...consumoDiario].sort(
      (a, b) =>
        new Date(a.data).getTime() -
        new Date(b.data).getTime()
    );
  }, [consumoDiario]);

  const maiorConsumoDiario = useMemo(() => {
    if (consumoDiarioOrdenado.length === 0) {
      return 0;
    }

    return Math.max(
      ...consumoDiarioOrdenado.map(
        (item) => item.consumoLitros
      )
    );
  }, [consumoDiarioOrdenado]);

  const vazaoMedia = useMemo(() => {
    if (medicoes.length === 0) {
      return 0;
    }

    const soma = medicoes.reduce(
      (total, medicao) =>
        total + Number(medicao.vazao),
      0
    );

    return soma / medicoes.length;
  }, [medicoes]);

  const possivelAnomalia =
    vazaoMedia > 10;

  return (
    <main className="min-h-screen bg-[#020b24] text-white">

      <header className="border-b border-blue-400/10 bg-[#030d29]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10">
              <Droplets className="h-6 w-6 text-blue-400" />
            </div>

            <div>
              <h1 className="text-lg font-semibold">
                Monitoramento de Água
              </h1>

              <p className="text-xs text-slate-500">
                Sistema de monitoramento residencial
              </p>
            </div>

          </div>

          <div className="flex items-center gap-4">

            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-white">
                {nome || "Usuário"}
              </p>

              <p className="text-xs text-slate-500">
                Usuário
              </p>
            </div>

            <button
              onClick={sair}
              className="
                flex
                h-10
                items-center
                gap-2
                rounded-xl
                border
                border-red-500/20
                bg-red-500/5
                px-4
                text-sm
                text-red-400
                transition-all
                duration-300
                hover:border-red-400/40
                hover:bg-red-500/10
              "
            >
              <LogOut className="h-4 w-4" />

              <span className="hidden sm:block">
                Sair
              </span>
            </button>

          </div>

        </div>
      </header>


      <div className="mx-auto max-w-7xl px-6 py-8">

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="mb-2 text-sm text-blue-400">
              Visão geral
            </p>

            <h2 className="text-3xl font-bold tracking-tight">
              Olá, {nome || "usuário"}!
            </h2>

            <p className="mt-2 text-slate-400">
              Acompanhe o consumo de água da sua residência.
            </p>
          </div>

          <button
            onClick={carregarDados}
            disabled={carregando}
            className="
              flex
              w-fit
              items-center
              gap-2
              rounded-xl
              border
              border-blue-400/20
              bg-blue-500/5
              px-4
              py-2.5
              text-sm
              text-slate-300
              transition-all
              duration-300
              hover:border-blue-400/40
              hover:bg-blue-500/10
              disabled:opacity-50
            "
          >
            <RefreshCw
              className={`h-4 w-4 ${
                carregando
                  ? "animate-spin"
                  : ""
              }`}
            />

            Atualizar
          </button>

        </div>


        {erro && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-red-400">
            <AlertTriangle className="h-5 w-5" />

            {erro}
          </div>
        )}


        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-blue-400/10 bg-blue-950/20 p-5 transition-all duration-300 hover:border-blue-400/25">

            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">
                <Droplets className="h-5 w-5 text-blue-400" />
              </div>

              <span className="text-xs text-slate-500">
                Hoje
              </span>

            </div>

            <p className="mt-5 text-sm text-slate-400">
              Consumo de hoje
            </p>

            <p className="mt-1 text-2xl font-bold">
              {carregando
                ? "..."
                : `${formatarNumero(
                    consumoHoje ?? 0
                  )} L`}
            </p>

          </div>


          <div className="rounded-2xl border border-blue-400/10 bg-blue-950/20 p-5 transition-all duration-300 hover:border-blue-400/25">

            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10">
                <CalendarDays className="h-5 w-5 text-cyan-400" />
              </div>

              <span className="text-xs text-slate-500">
                Este mês
              </span>

            </div>

            <p className="mt-5 text-sm text-slate-400">
              Consumo mensal
            </p>

            <p className="mt-1 text-2xl font-bold">
              {carregando
                ? "..."
                : `${formatarNumero(
                    resumoMensal?.consumoLitros ?? 0
                  )} L`}
            </p>

          </div>

          <div className="rounded-2xl border border-blue-400/10 bg-blue-950/20 p-5 transition-all duration-300 hover:border-blue-400/25">

            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10">
                <Waves className="h-5 w-5 text-indigo-400" />
              </div>

              <span className="text-xs text-slate-500">
                Este mês
              </span>

            </div>

            <p className="mt-5 text-sm text-slate-400">
              Volume consumido
            </p>

            <p className="mt-1 text-2xl font-bold">
              {carregando
                ? "..."
                : `${formatarNumero(
                    resumoMensal?.consumoM3 ?? 0
                  )} m³`}
            </p>

          </div>

          <div className="rounded-2xl border border-blue-400/10 bg-blue-950/20 p-5 transition-all duration-300 hover:border-blue-400/25">

            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              </div>

              <span className="text-xs text-slate-500">
                Estimativa
              </span>

            </div>

            <p className="mt-5 text-sm text-slate-400">
              Valor estimado
            </p>

            <p className="mt-1 text-2xl font-bold">
              {carregando
                ? "..."
                : formatarMoeda(
                    resumoMensal?.valorEstimado ?? 0
                  )}
            </p>

          </div>

        </div>


        <div className="mt-6 grid gap-6 lg:grid-cols-3">

          <div className="rounded-2xl border border-blue-400/10 bg-blue-950/20 p-6 lg:col-span-1">

            <div className="mb-6 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                <Activity className="h-5 w-5 text-blue-400" />
              </div>

              <div>
                <h3 className="font-semibold">
                  Resumo da conta
                </h3>

                <p className="text-xs text-slate-500">
                  Estimativa do mês atual
                </p>
              </div>

            </div>

            <div className="space-y-4">

              <div className="flex items-center justify-between border-b border-blue-400/10 pb-3">
                <span className="text-sm text-slate-400">
                  Água
                </span>

                <span className="font-medium">
                  {formatarMoeda(
                    resumoMensal?.valorAgua ?? 0
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-blue-400/10 pb-3">
                <span className="text-sm text-slate-400">
                  Esgoto
                </span>

                <span className="font-medium">
                  {formatarMoeda(
                    resumoMensal?.valorEsgoto ?? 0
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-sm font-medium text-slate-300">
                  Total estimado
                </span>

                <span className="text-xl font-bold text-blue-400">
                  {formatarMoeda(
                    resumoMensal?.valorEstimado ?? 0
                  )}
                </span>
              </div>

            </div>

          </div>


          <div className="rounded-2xl border border-blue-400/10 bg-blue-950/20 p-6 lg:col-span-2">

            <div className="mb-6 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                <AlertTriangle className="h-5 w-5 text-blue-400" />
              </div>

              <div>
                <h3 className="font-semibold">
                  Monitoramento
                </h3>

                <p className="text-xs text-slate-500">
                  Análise das medições registradas
                </p>
              </div>

            </div>

            {medicoes.length === 0 ? (

              <div className="rounded-xl border border-blue-400/10 bg-blue-500/5 p-5">
                <p className="text-sm text-slate-400">
                  Ainda não existem medições suficientes
                  para realizar uma análise.
                </p>
              </div>

            ) : possivelAnomalia ? (

              <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5">

                <div className="flex items-start gap-3">

                  <AlertTriangle className="mt-0.5 h-5 w-5 text-yellow-400" />

                  <div>

                    <p className="font-medium text-yellow-300">
                      Atenção ao consumo
                    </p>

                    <p className="mt-1 text-sm text-yellow-200/70">
                      Foi identificada uma vazão média
                      elevada nas medições registradas.
                      Verifique se o consumo está de
                      acordo com o uso da residência.
                    </p>

                  </div>

                </div>

              </div>

            ) : (

              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">

                <div className="flex items-start gap-3">

                  <Activity className="mt-0.5 h-5 w-5 text-emerald-400" />

                  <div>

                    <p className="font-medium text-emerald-300">
                      Consumo dentro do esperado
                    </p>

                    <p className="mt-1 text-sm text-emerald-200/70">
                      As medições registradas não
                      apresentam, neste momento, uma
                      vazão média elevada.
                    </p>

                  </div>

                </div>

              </div>

            )}

          </div>

        </div>

        <div className="mt-6 rounded-2xl border border-blue-400/10 bg-blue-950/20 p-6">

          <div className="mb-6 flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
                <BarChart3 className="h-5 w-5 text-indigo-400" />
              </div>

              <div>
                <h3 className="font-semibold">
                  Consumo diário
                </h3>

                <p className="text-xs text-slate-500">
                  Consumo registrado por dia no mês atual
                </p>
              </div>

            </div>

            {consumoDiarioOrdenado.length > 0 && (
              <span className="rounded-lg bg-indigo-500/10 px-3 py-1.5 text-xs text-indigo-400">
                {consumoDiarioOrdenado.length} dias
              </span>
            )}

          </div>


          {carregando ? (

            <div className="flex h-72 items-center justify-center rounded-xl border border-blue-400/10 bg-blue-500/5">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Carregando gráfico...
              </div>
            </div>

          ) : consumoDiarioOrdenado.length === 0 ? (

            <div className="flex h-72 flex-col items-center justify-center rounded-xl border border-blue-400/10 bg-blue-500/5 text-center">

              <BarChart3 className="h-8 w-8 text-slate-600" />

              <p className="mt-3 text-sm text-slate-500">
                Ainda não existem dados suficientes
                para apresentar o gráfico.
              </p>

            </div>

          ) : (

            <div className="rounded-xl border border-blue-400/10 bg-[#030d29]/50 p-5">

              <div className="flex h-72 gap-4">

                <div className="flex w-12 flex-col justify-between pb-8 text-right text-[11px] text-slate-600">

                  <span>
                    {formatarNumero(maiorConsumoDiario)} L
                  </span>

                  <span>
                    {formatarNumero(
                      maiorConsumoDiario * 0.75
                    )} L
                  </span>

                  <span>
                    {formatarNumero(
                      maiorConsumoDiario * 0.5
                    )} L
                  </span>

                  <span>
                    {formatarNumero(
                      maiorConsumoDiario * 0.25
                    )} L
                  </span>

                  <span>0 L</span>

                </div>

                <div className="relative flex flex-1 items-end gap-3 overflow-x-auto border-l border-b border-blue-400/10 px-4 pb-8">

                  <div className="pointer-events-none absolute inset-x-4 top-0 border-t border-blue-400/5" />

                  <div className="pointer-events-none absolute inset-x-4 top-1/4 border-t border-blue-400/5" />

                  <div className="pointer-events-none absolute inset-x-4 top-1/2 border-t border-blue-400/5" />

                  <div className="pointer-events-none absolute inset-x-4 top-3/4 border-t border-blue-400/5" />


                  {consumoDiarioOrdenado.map(
                    (item) => {

                      const porcentagem =
                        maiorConsumoDiario > 0
                          ? (item.consumoLitros /
                              maiorConsumoDiario) *
                            100
                          : 0;

                      return (
                        <div
                          key={item.data}
                          className="group flex h-full min-w-16 flex-1 flex-col items-center justify-end"
                        >

                          <span className="mb-2 text-xs font-medium text-slate-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                            {formatarNumero(
                              item.consumoLitros
                            )}{" "}
                            L
                          </span>

                          <div
                            className="
                              w-9
                              rounded-t-lg
                              bg-blue-500/70
                              transition-all
                              duration-300
                              group-hover:bg-blue-400
                              group-hover:shadow-lg
                              group-hover:shadow-blue-500/20
                            "
                            style={{
                              height: `${Math.max(
                                porcentagem,
                                4
                              )}%`,
                            }}
                            title={`${formatarNumero(
                              item.consumoLitros
                            )} L`}
                          />

                          <span className="mt-3 text-xs text-slate-500">
                            {formatarDia(item.data)}
                          </span>

                        </div>
                      );
                    }
                  )}

                </div>

              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                <span className="h-2.5 w-2.5 rounded-sm bg-blue-500/70" />

                Consumo em litros

              </div>

            </div>

          )}

        </div>

        <div className="mt-6 rounded-2xl border border-blue-400/10 bg-blue-950/20 p-6">

          <div className="mb-6 flex items-center justify-between">

            <div>

              <h3 className="font-semibold">
                Últimas medições
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Dados recebidos pelo sistema
              </p>

            </div>

            <span className="rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs text-blue-400">
              {medicoes.length} medições
            </span>

          </div>


          {medicoesRecentes.length === 0 ? (

            <div className="rounded-xl border border-blue-400/10 bg-blue-500/5 p-6 text-center">

              <Droplets className="mx-auto h-8 w-8 text-slate-600" />

              <p className="mt-3 text-sm text-slate-500">
                Nenhuma medição encontrada.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-162.5">

                <thead>

                  <tr className="border-b border-blue-400/10 text-left">

                    <th className="pb-3 text-xs font-medium uppercase tracking-wider text-slate-500">
                      Data / Hora
                    </th>

                    <th className="pb-3 text-xs font-medium uppercase tracking-wider text-slate-500">
                      Vazão
                    </th>

                    <th className="pb-3 text-xs font-medium uppercase tracking-wider text-slate-500">
                      Volume
                    </th>

                    <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                      ID
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {medicoesRecentes.map(
                    (medicao) => (
                      <tr
                        key={medicao.medicaoId}
                        className="border-b border-blue-400/5 transition-colors hover:bg-blue-500/5"
                      >

                        <td className="py-4 text-sm text-slate-300">
                          {formatarData(
                            medicao.dataHora
                          )}
                        </td>

                        <td className="py-4 text-sm text-slate-300">
                          {formatarNumero(
                            Number(medicao.vazao)
                          )}{" "}
                          L/min
                        </td>

                        <td className="py-4 text-sm text-slate-300">
                          {formatarNumero(
                            Number(
                              medicao.volumeLitros
                            )
                          )}{" "}
                          L
                        </td>

                        <td className="py-4 text-right text-xs text-slate-500">
                          {medicao.medicaoId}
                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

        <footer className="mt-10 border-t border-blue-400/10 py-6">

          <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">

            <p className="text-sm text-slate-500">
              💧 Monitoramento inteligente de água
            </p>

            <p className="text-xs text-slate-600">
              Projeto de TCC • 2026
            </p>

          </div>

        </footer>

      </div>

    </main>
  );
}