import Reveal from "@/components/shared/Reveal";
import { Gauge, Cpu, Database, ChartNoAxesCombined } from "lucide-react";

type EtapaProps = {
  numero: string;
  icone: React.ReactNode;
  titulo: string;
  descricao: string;
};

function Etapa({ numero, icone, titulo, descricao }: EtapaProps) {
  return (
    <div
      className="
        h-full
        rounded-2xl
        border
        border-blue-400/20
        bg-blue-950/20
        p-6
        backdrop-blur-sm
        transition-all
        duration-500
        hover:-translate-y-1
        hover:border-blue-400/50
      "
    >
      <span className="text-sm font-semibold text-blue-400">{numero}</span>

      <div
        className="
          mt-6
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-xl
          bg-blue-500/10
          text-blue-400
        "
      >
        {icone}
      </div>

      <h3 className="mt-5 text-xl font-semibold">{titulo}</h3>

      <p className="mt-3 leading-7 text-slate-300/70">{descricao}</p>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section id="funcionamento" className="relative bg-transparent px-6 py-32">
      <div className="relative z-10 mx-auto max-w-7xl">
        <Reveal>
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-400">
              Como funciona
            </p>

            <h2 className="text-3xl font-bold sm:text-4xl">
              Da sua tubulação até a plataforma
            </h2>
          </div>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-4">
          <Reveal delay={0}>
            <Etapa
              numero="01"
              icone={<Gauge size={28} strokeWidth={1.8} />}
              titulo="Sensor"
              descricao="Mede a passagem de água pela tubulação."
            />
          </Reveal>

          <Reveal delay={150}>
            <Etapa
              numero="02"
              icone={<Cpu size={28} strokeWidth={1.8} />}
              titulo="ESP32"
              descricao="Processa as medições e realiza a comunicação."
            />
          </Reveal>

          <Reveal delay={300}>
            <Etapa
              numero="03"
              icone={<Database size={28} strokeWidth={1.8} />}
              titulo="Plataforma"
              descricao="As informações são armazenadas e processadas."
            />
          </Reveal>

          <Reveal delay={450}>
            <Etapa
              numero="04"
              icone={<ChartNoAxesCombined size={28} strokeWidth={1.8} />}
              titulo="Dashboard"
              descricao="O usuário acompanha consumo, custos e históricos."
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
