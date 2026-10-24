"use client";

import { useState } from "react";
import { CalendarDays, Check, Search } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const opcoesTipo: {
  value: TipoRelatorio;
  label: string;
}[] = [
  { value: "mes", label: "Um único mês" },
  { value: "varios", label: "Vários meses selecionados" },
  { value: "todos", label: "Todos os meses do ano" },
  { value: "periodo", label: "Período personalizado" },
];

const classeLabel = "mb-2 block text-sm font-medium text-slate-300";

const classeTrigger =
  "h-14! w-full min-w-0 rounded-xl " +
  "border border-blue-400/20 bg-[#030d29] " +
  "px-4 text-sm text-slate-100 shadow-none " +
  "outline-none transition-colors " +
  "hover:border-blue-400/40 " +
  "focus-visible:border-blue-400/60 " +
  "focus-visible:ring-2 focus-visible:ring-blue-500/20 " +
  "data-[popup-open]:border-blue-400/60 " +
  "[&_svg]:text-blue-300";

const classeContent =
  "z-[100] max-h-64 rounded-xl " +
  "border border-blue-400/20 bg-[#07142f] " +
  "text-slate-100 shadow-xl shadow-black/40";

const classeItem =
  "cursor-pointer rounded-lg px-3 py-2.5 " +
  "text-sm text-slate-200 outline-none " +
  "transition-colors " +
  "data-[highlighted]:bg-blue-600/20 " +
  "data-[highlighted]:text-white " +
  "data-[selected]:bg-blue-600/15 " +
  "data-[selected]:text-blue-200";
type Opcao = {
  value: string;
  label: string;
};

interface CampoSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Opcao[];
}

function CampoSelect({
  id,
  label,
  value,
  onChange,
  options,
}: CampoSelectProps) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className={classeLabel}>
        {label}
      </label>

      <Select
        value={value}
        onValueChange={(novoValor) => {
          if (novoValor !== null) {
            onChange(novoValor);
          }
        }}
      >
        <SelectTrigger id={id} className={classeTrigger} aria-label={label}>
          <SelectValue>
            {options.find((option) => option.value === value)?.label ??
              "Selecione uma opção"}
          </SelectValue>
        </SelectTrigger>

        <SelectContent
          align="start"
          side="bottom"
          sideOffset={5}
          alignItemWithTrigger={false}
          className={classeContent}
        >
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className={classeItem}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

const opcoesMeses = nomesMeses.map((nome, index) => ({
  value: String(index + 1),
  label: nome,
}));

const opcoesAnos = anosDisponiveis.map((ano) => ({
  value: String(ano),
  label: String(ano),
}));

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

  return (
    <section className="space-y-6 rounded-2xl border border-blue-400/10 bg-blue-950/20 p-5 sm:p-6">
      <div>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-blue-400" />

          <h2 className="text-xl font-semibold text-white">
            Gerar relatório de consumo
          </h2>
        </div>

        <p className="mt-2 text-sm text-slate-400">
          Selecione o período que deseja consultar.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <CampoSelect
          id="tipo-relatorio"
          label="Tipo de relatório"
          value={tipo}
          onChange={(value) => setTipo(value as TipoRelatorio)}
          options={opcoesTipo}
        />

        {(tipo === "todos" || tipo === "mes" || tipo === "varios") && (
          <CampoSelect
            id="ano-relatorio"
            label="Ano"
            value={String(ano)}
            onChange={(value) => setAno(Number(value))}
            options={opcoesAnos}
          />
        )}
      </div>

      {tipo === "mes" && (
        <div className="max-w-md">
          <CampoSelect
            id="mes-relatorio"
            label="Mês"
            value={String(mes)}
            onChange={(value) => setMes(Number(value))}
            options={opcoesMeses}
          />
        </div>
      )}

      {tipo === "varios" && (
        <fieldset className="space-y-3">
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
                  className={
                    "flex cursor-pointer items-center justify-between " +
                    "gap-2 rounded-xl border p-3 text-sm " +
                    "transition-all duration-200 " +
                    (selecionado
                      ? "border-blue-400/50 bg-blue-500/15 text-blue-100 shadow-sm shadow-blue-500/10"
                      : "border-blue-400/10 bg-[#030d29]/60 text-slate-300 hover:border-blue-400/30 hover:bg-blue-500/5")
                  }
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selecionado}
                      onChange={() => alternarMes(numeroMes)}
                      className="sr-only"
                    />

                    <span>{nome}</span>
                  </span>

                  <span
                    className={
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition " +
                      (selecionado
                        ? "border-blue-500 bg-blue-600 text-white"
                        : "border-slate-600 bg-[#07142f]")
                    }
                  >
                    {selecionado && <Check className="h-3.5 w-3.5" />}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      {tipo === "periodo" && (
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            Escolha o mês e o ano de início e de término.
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-4 rounded-xl border border-blue-400/10 bg-[#030d29]/50 p-4">
              <h3 className="flex items-center gap-2 font-semibold text-white">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                Data inicial
              </h3>

              <CampoSelect
                id="mes-inicial"
                label="Mês inicial"
                value={String(mesInicial)}
                onChange={(value) => setMesInicial(Number(value))}
                options={opcoesMeses}
              />

              <CampoSelect
                id="ano-inicial"
                label="Ano inicial"
                value={String(anoInicial)}
                onChange={(value) => setAnoInicial(Number(value))}
                options={opcoesAnos}
              />
            </div>

            <div className="space-y-4 rounded-xl border border-blue-400/10 bg-[#030d29]/50 p-4">
              <h3 className="flex items-center gap-2 font-semibold text-white">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Data final
              </h3>

              <CampoSelect
                id="mes-final"
                label="Mês final"
                value={String(mesFinal)}
                onChange={(value) => setMesFinal(Number(value))}
                options={opcoesMeses}
              />

              <CampoSelect
                id="ano-final"
                label="Ano final"
                value={String(anoFinal)}
                onChange={(value) => setAnoFinal(Number(value))}
                options={opcoesAnos}
              />
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={consultar}
        disabled={carregando}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/15 transition-all duration-200 hover:bg-blue-500 hover:shadow-blue-500/25 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        <Search className="h-4 w-4" />

        {carregando ? "Consultando..." : "Consultar relatório"}
      </button>
    </section>
  );
}
