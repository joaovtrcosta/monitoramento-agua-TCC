"use client";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ptBR } from "date-fns/locale";
import { CalendarDays, Search } from "lucide-react";

interface CalendarioProps {
  value: string;
  onChange: (data: string) => void;
  onConsultar: () => void;
  carregando?: boolean;
}

export default function Calendario({
  value,
  onChange,
  onConsultar,
  carregando = false,
}: CalendarioProps) {
  const dataSelecionada = value
    ? new Date(
        Number(value.split("-")[0]),
        Number(value.split("-")[1]) - 1,
        Number(value.split("-")[2]),
      )
    : undefined;

  function selecionarData(data: Date | undefined) {
    if (!data) return;

    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");

    onChange(`${ano}-${mes}-${dia}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Popover>
        <PopoverTrigger
          type="button"
          className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-blue-400/20 bg-[#030d29] px-4 text-sm text-slate-200 transition hover:border-blue-400/50 hover:bg-blue-500/10 hover:text-blue-300"
        >
          <CalendarDays className="h-4 w-4 text-blue-400" />

          {dataSelecionada
            ? dataSelecionada.toLocaleDateString("pt-BR")
            : "Selecionar data"}
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-auto border border-blue-400/20 bg-[#021b38] p-2 text-white shadow-xl shadow-black/30"
        >
          <Calendar
            mode="single"
            selected={dataSelecionada}
            onSelect={selecionarData}
            locale={ptBR}
            className="rounded-xl border border-blue-400/10 bg-[#071a30] p-3 text-blue-100"
            classNames={{
              caption_label: "font-semibold text-white",

              button_previous:
                "text-blue-300 hover:bg-blue-500/15 hover:text-white",
              button_next:
                "text-blue-300 hover:bg-blue-500/15 hover:text-white",

              weekday: "font-medium text-blue-300/60",

              day: "text-blue-100",

              day_button:
                "h-9 w-9 cursor-pointer rounded-lg border border-transparent text-blue-100 transition-colors hover:bg-blue-500/20 hover:text-white",

              selected:
                "rounded-lg bg-blue-600 text-white hover:bg-blue-500 hover:text-white",

              today: "rounded-lg border border-blue-400/40 text-blue-200",

              outside: "text-slate-600 opacity-40",
              disabled: "text-slate-600 opacity-30",
            }}
          />
        </PopoverContent>
      </Popover>

      <Button
        type="button"
        onClick={onConsultar}
        disabled={!value || carregando}
        className="h-11 cursor-pointer gap-2 bg-blue-600 text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Search className="h-4 w-4" />
        {carregando ? "Consultando..." : "Consultar"}
      </Button>
    </div>
  );
}
