"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Info,
  Lightbulb,
  Pause,
  Play,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

type TipoAviso = "info" | "sucesso" | "alerta";

type Aviso = {
  id: string;
  titulo: string;
  descricao: string;
  tipo: TipoAviso;
  icone: LucideIcon;
  link?: string;
  textoLink?: string;
};

type NotificacoesDashboardProps = {
  consumoHoje?: number | null;
  consumoMes?: number | null;
  possivelVazamento?: boolean | null;
};

const TEMPO_TROCA = 5000;

const estilos = {
  info: {
    icone: "text-blue-400",
    fundo: "bg-blue-500/10",
    borda: "border-blue-400/20",
    indicador: "bg-blue-400",
  },
  sucesso: {
    icone: "text-emerald-400",
    fundo: "bg-emerald-500/10",
    borda: "border-emerald-400/20",
    indicador: "bg-emerald-400",
  },
  alerta: {
    icone: "text-amber-400",
    fundo: "bg-amber-500/10",
    borda: "border-amber-400/20",
    indicador: "bg-amber-400",
  },
};

function formatarLitros(valor: number) {
  return valor.toLocaleString("pt-BR", {
    maximumFractionDigits: 2,
  });
}

export default function NotificacoesDashboard({
  consumoHoje,
  consumoMes,
  possivelVazamento,
}: NotificacoesDashboardProps) {
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [pausado, setPausado] = useState(false);

  const avisos: Aviso[] = [];

  if (possivelVazamento === true) {
    avisos.push({
      id: "vazamento",
      titulo: "Atenção: possível vazamento identificado",
      descricao:
        "A análise encontrou um padrão de fluxo que pode indicar vazamento. Confira os detalhes e verifique os pontos de consumo.",
      tipo: "alerta",
      icone: AlertTriangle,
      link: "/dashboard/alertas",
      textoLink: "Verificar alerta",
    });
  }

  if (possivelVazamento === false) {
    avisos.push({
      id: "sem-vazamento",
      titulo: "Nenhum padrão de vazamento identificado",
      descricao:
        "A última análise informada não identificou padrões de vazamento pelos critérios configurados. Continue acompanhando suas medições.",
      tipo: "sucesso",
      icone: CheckCircle2,
      link: "/dashboard/alertas",
      textoLink: "Ver análise",
    });
  }

  if (
    typeof consumoHoje === "number" &&
    Number.isFinite(consumoHoje)
  ) {
    avisos.push({
      id: "consumo-hoje",
      titulo: "Consumo registrado hoje",
      descricao: `Até o momento, o sistema registrou ${formatarLitros(
        consumoHoje
      )} litros de água no dia de hoje.`,
      tipo: "info",
      icone: Droplets,
      link: "/dashboard/consumo",
      textoLink: "Ver consumo diário",
    });
  }

  if (
    typeof consumoMes === "number" &&
    Number.isFinite(consumoMes)
  ) {
    avisos.push({
      id: "consumo-mes",
      titulo: "Acompanhe o consumo mensal",
      descricao: `O volume registrado neste mês é de ${formatarLitros(
        consumoMes
      )} litros. Consulte os dados diários para acompanhar a evolução.`,
      tipo: "info",
      icone: TrendingUp,
      link: "/dashboard/consumo",
      textoLink: "Consultar consumo",
    });
  }

  avisos.push(
    {
      id: "economia",
      titulo: "Dica para economizar água",
      descricao:
        "Evite deixar torneiras abertas durante atividades como escovar os dentes e lavar utensílios. Pequenas mudanças ajudam a reduzir o desperdício.",
      tipo: "info",
      icone: Lightbulb,
    },
    {
      id: "historico",
      titulo: "Consulte seu histórico de medições",
      descricao:
        "Acompanhar os registros anteriores ajuda a entender como o consumo de água varia ao longo dos dias.",
      tipo: "info",
      icone: Bell,
      link: "/dashboard/historico",
      textoLink: "Ver histórico",
    },
    {
      id: "analises",
      titulo: "Conheça seus padrões de consumo",
      descricao:
        "Utilize a análise estatística para identificar dias com consumo diferente do padrão observado no histórico.",
      tipo: "info",
      icone: Info,
      link: "/dashboard/analises",
      textoLink: "Ver análise",
    }
  );

  const totalAvisos = avisos.length;
  const indiceSeguro = indiceAtual % totalAvisos;
  const avisoAtual = avisos[indiceSeguro];
  const estilo = estilos[avisoAtual.tipo];
  const IconeAtual = avisoAtual.icone;

  useEffect(() => {
    if (pausado || totalAvisos <= 1) return;

    const intervalo = window.setInterval(() => {
      setIndiceAtual((atual) => (atual + 1) % totalAvisos);
    }, TEMPO_TROCA);

    return () => window.clearInterval(intervalo);
  }, [pausado, totalAvisos]);

  function proximoAviso() {
    setIndiceAtual((atual) => (atual + 1) % totalAvisos);
  }

  function avisoAnterior() {
    setIndiceAtual(
      (atual) => (atual - 1 + totalAvisos) % totalAvisos
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-blue-400/10 bg-blue-950/20 p-5 text-white sm:p-6">

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-500/10 p-3">
            <Bell className="h-5 w-5 text-blue-400" />
          </div>

          <div>
            <h2 className="font-semibold">
              Central de avisos
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Informações e orientações sobre seu consumo
            </p>
          </div>
        </div>

        <span className="rounded-lg border border-blue-400/15 bg-blue-500/10 px-3 py-2 text-xs text-blue-300">
          {indiceSeguro + 1} de {totalAvisos}
        </span>
      </div>

      <div
        aria-live="off"
        className={`rounded-xl border ${estilo.borda} ${estilo.fundo} p-5 transition-colors sm:p-6`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`shrink-0 rounded-xl border ${estilo.borda} bg-[#071633]/40 p-3`}
          >
            <IconeAtual
              className={`h-6 w-6 ${estilo.icone}`}
            />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-white sm:text-lg">
              {avisoAtual.titulo}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              {avisoAtual.descricao}
            </p>

            {avisoAtual.link && (
              <Link
                href={avisoAtual.link}
                className={`mt-4 inline-flex items-center gap-2 text-sm font-medium ${estilo.icone} transition hover:underline`}
              >
                {avisoAtual.textoLink}
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {avisos.map((aviso, indice) => (
            <button
              key={aviso.id}
              type="button"
              onClick={() => setIndiceAtual(indice)}
              aria-label={`Mostrar aviso ${indice + 1}`}
              aria-current={
                indice === indiceSeguro ? "true" : undefined
              }
              className={`h-2 rounded-full transition-all ${
                indice === indiceSeguro
                  ? `w-7 ${estilo.indicador}`
                  : "w-2 bg-slate-600 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPausado((atual) => !atual)}
            aria-label={
              pausado
                ? "Retomar avisos automáticos"
                : "Pausar avisos automáticos"
            }
            title={
              pausado
                ? "Retomar reprodução"
                : "Pausar reprodução"
            }
            className="rounded-lg border border-blue-400/15 p-2.5 text-slate-300 transition hover:bg-blue-500/10"
          >
            {pausado ? (
              <Play className="h-4 w-4" />
            ) : (
              <Pause className="h-4 w-4" />
            )}
          </button>

          <button
            type="button"
            onClick={avisoAnterior}
            aria-label="Aviso anterior"
            className="rounded-lg border border-blue-400/15 p-2.5 text-slate-300 transition hover:bg-blue-500/10"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={proximoAviso}
            aria-label="Próximo aviso"
            className="rounded-lg border border-blue-400/15 p-2.5 text-slate-300 transition hover:bg-blue-500/10"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!pausado && (
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-blue-950">
          <div
            key={indiceSeguro}
            className={`h-full ${estilo.indicador}`}
            style={{
              animation: `progressoAviso ${TEMPO_TROCA}ms linear forwards`,
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes progressoAviso {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
