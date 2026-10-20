"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export type TipoRelatorio = "mes" | "varios" | "todos" | "periodo";

export interface FiltrosRelatorio {
  tipo: TipoRelatorio;
  ano: number;
  mes: number;
  meses: number[];
  anoInicial?: number;
  mesInicial?: number;
  anoFinal?: number;
  mesFinal?: number;
}

interface FiltroRelatorioProps {
  onConsultar: (filtros: FiltrosRelatorio) => void;
  carregando?: boolean;
}

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

const anoAtual = new Date().getFullYear();

const anosDisponiveis = Array.from({ length: 11 }, (_, i) => anoAtual - 5 + i);

export default function FiltroRelatorio({
  onConsultar,
  carregando = false,
}: FiltroRelatorioProps) {
  const [tipo, setTipo] = useState<TipoRelatorio>("todos");

  const [ano, setAno] = useState(anoAtual);
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [meses, setMeses] = useState<number[]>([]);

  const [anoInicial, setAnoInicial] = useState(anoAtual - 1);
  const [mesInicial, setMesInicial] = useState(1);

  const [anoFinal, setAnoFinal] = useState(anoAtual);
  const [mesFinal, setMesFinal] = useState(new Date().getMonth() + 1);

  function alternarMes(numeroMes: number) {
    setMeses((atuais) =>
      atuais.includes(numeroMes)
        ? atuais.filter((m) => m !== numeroMes)
        : [...atuais, numeroMes].sort((a, b) => a - b),
    );
  }

  function consultar() {
    if (tipo === "varios" && meses.length === 0) {
      alert("Selecione pelo menos um mês.");
      return;
    }

    if (
      tipo === "periodo" &&
      (anoInicial > anoFinal ||
        (anoInicial === anoFinal && mesInicial > mesFinal))
    ) {
      alert("O período inicial deve ser anterior ao período final.");
      return;
    }

    onConsultar({
      tipo,
      ano,
      mes,
      meses,
      ...(tipo === "periodo"
        ? {
            anoInicial,
            mesInicial,
            anoFinal,
            mesFinal,
          }
        : {}),
    });
  }

  const classeCampo =
    "w-full appearance-none rounded-xl border border-blue-400/15 bg-[#030d29] px-4 py-3 pr-12 text-sm text-white outline-none transition focus:border-blue-400/50 focus:ring-2 focus:ring-blue-500/20";

  const classeLabel = "mb-2 block text-sm font-medium text-slate-300";

  return (
    <section className="space-y-5 rounded-2xl border border-blue-400/10 bg-blue-950/20 p-5 sm:p-6">
      <div>
        <h2 className="text-xl font-semibold text-white">
          Gerar relatório de consumo
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Selecione o período que deseja consultar.
        </p>
      </div>

      {/* Tipo de relatório e ano */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="tipo-relatorio" className={classeLabel}>
            Tipo de relatório
          </label>

          <div className="relative">
            <select
              id="tipo-relatorio"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoRelatorio)}
              className={classeCampo}
            >
              <option value="mes">Um único mês</option>
              <option value="varios">Vários meses selecionados</option>
              <option value="todos">Todos os meses do ano</option>
              <option value="periodo">Período personalizado</option>
            </select>

            <ChevronDown
              size={18}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>

        {(tipo === "todos" || tipo === "mes" || tipo === "varios") && (
          <div>
            <label htmlFor="ano-relatorio" className={classeLabel}>
              Ano
            </label>

            <div className="relative">
              <select
                id="ano-relatorio"
                value={ano}
                onChange={(e) => setAno(Number(e.target.value))}
                className={classeCampo}
              >
                {anosDisponiveis.map((anoOpcao) => (
                  <option key={anoOpcao} value={anoOpcao}>
                    {anoOpcao}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* Seleção de um único mês */}
      {tipo === "mes" && (
        <div>
          <label htmlFor="mes-relatorio" className={classeLabel}>
            Mês
          </label>

          <div className="relative">
            <select
              id="mes-relatorio"
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className={classeCampo}
            >
              {nomesMeses.map((nome, i) => (
                <option key={nome} value={i + 1}>
                  {nome}
                </option>
              ))}
            </select>

            <ChevronDown
              size={18}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>
      )}

      {/* Seleção de vários meses */}
      {tipo === "varios" && (
        <fieldset>
          <legend className="mb-3 text-sm font-medium text-slate-300">
            Selecione os meses desejados
          </legend>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {nomesMeses.map((nome, i) => {
              const numeroMes = i + 1;
              const selecionado = meses.includes(numeroMes);

              return (
                <label
                  key={nome}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm transition ${
                    selecionado
                      ? "border-blue-400/40 bg-blue-500/10 text-blue-200"
                      : "border-blue-400/10 bg-[#030d29]/60 text-slate-300 hover:border-blue-400/30 hover:bg-blue-500/5"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selecionado}
                    onChange={() => alternarMes(numeroMes)}
                    className="h-4 w-4 accent-blue-500"
                  />

                  {nome}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      {/* Seleção de período personalizado */}
      {tipo === "periodo" && (
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            Escolha o mês e o ano de início e de término.
          </p>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            <div className="space-y-4 rounded-xl border border-blue-400/10 bg-[#030d29]/50 p-4">
              <h3 className="font-semibold text-white">Data inicial</h3>

              <div>
                <label htmlFor="mes-inicial" className={classeLabel}>
                  Mês inicial
                </label>

                <div className="relative">
                  <select
                    id="mes-inicial"
                    value={mesInicial}
                    onChange={(e) => setMesInicial(Number(e.target.value))}
                    className={classeCampo}
                  >
                    {nomesMeses.map((nome, i) => (
                      <option key={nome} value={i + 1}>
                        {nome}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={18}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="ano-inicial" className={classeLabel}>
                  Ano inicial
                </label>

                <div className="relative">
                  <select
                    id="ano-inicial"
                    value={anoInicial}
                    onChange={(e) => setAnoInicial(Number(e.target.value))}
                    className={classeCampo}
                  >
                    {anosDisponiveis.map((anoOpcao) => (
                      <option key={anoOpcao} value={anoOpcao}>
                        {anoOpcao}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={18}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-xl border border-blue-400/10 bg-[#030d29]/50 p-4">
              <h3 className="font-semibold text-white">Data final</h3>

              <div>
                <label htmlFor="mes-final" className={classeLabel}>
                  Mês final
                </label>

                <div className="relative">
                  <select
                    id="mes-final"
                    value={mesFinal}
                    onChange={(e) => setMesFinal(Number(e.target.value))}
                    className={classeCampo}
                  >
                    {nomesMeses.map((nome, i) => (
                      <option key={nome} value={i + 1}>
                        {nome}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={18}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="ano-final" className={classeLabel}>
                  Ano final
                </label>

                <div className="relative">
                  <select
                    id="ano-final"
                    value={anoFinal}
                    onChange={(e) => setAnoFinal(Number(e.target.value))}
                    className={classeCampo}
                  >
                    {anosDisponiveis.map((anoOpcao) => (
                      <option key={anoOpcao} value={anoOpcao}>
                        {anoOpcao}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={18}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={consultar}
        disabled={carregando}
        className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {carregando ? "Consultando..." : "Consultar relatório"}
      </button>
    </section>
  );
}
