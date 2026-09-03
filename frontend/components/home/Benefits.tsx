import Reveal from "@/components/shared/Reveal";

import {
  Activity,
  ChartNoAxesCombined,
  BellRing,
  CircleDollarSign,
} from "lucide-react";

type BeneficioProps = {
  icone: React.ReactNode;
  titulo: string;
  descricao: string;
};

function Beneficio({ icone, titulo, descricao }: BeneficioProps) {
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
      <div
        className="
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

export default function Benefits() {
  return (
    <section id="beneficios" className="relative bg-transparent px-6 py-32">
      <div className="relative z-10 mx-auto max-w-7xl">
        <Reveal>
          <div className="mb-14 text-center">
            <p
              className="
                mb-3
                text-sm
                font-semibold
                uppercase
                tracking-widest
                text-blue-400
              "
            >
              Benefícios
            </p>

            <h2
              className="
                text-3xl
                font-medium
                uppercase
                sm:text-4xl
              "
            >
              Mais informação sobre seu consumo
            </h2>
          </div>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Reveal delay={0}>
            <Beneficio
              icone={<Activity size={28} strokeWidth={1.8} />}
              titulo="Tempo real"
              descricao="Acompanhe informações atualizadas sobre o consumo de água."
            />
          </Reveal>

          <Reveal delay={150}>
            <Beneficio
              icone={<ChartNoAxesCombined size={28} strokeWidth={1.8} />}
              titulo="Histórico"
              descricao="Visualize o comportamento do consumo ao longo do tempo."
            />
          </Reveal>

          <Reveal delay={300}>
            <Beneficio
              icone={<BellRing size={28} strokeWidth={1.8} />}
              titulo="Alertas"
              descricao="Identifique situações de consumo excessivo ou possíveis anomalias."
            />
          </Reveal>

          <Reveal delay={450}>
            <Beneficio
              icone={<CircleDollarSign size={28} strokeWidth={1.8} />}
              titulo="Estimativa de custos"
              descricao="Tenha uma estimativa dos gastos relacionados ao consumo."
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
