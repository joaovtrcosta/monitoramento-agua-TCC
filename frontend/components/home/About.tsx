import Image from "next/image";
import Reveal from "@/components/shared/Reveal";

export default function About() {
  return (
    <section id="sobre" className="relative bg-transparent px-6 py-32">
      <div
        className="
          relative
          z-10
          mx-auto
          grid
          max-w-7xl
          items-center
          gap-20
          lg:grid-cols-2
        "
      >
        {/* IMAGEM */}
        <Reveal className="order-2 lg:order-1">
          <div
            className="
              relative
              overflow-hidden
              rounded-3xl
              border
              border-blue-400/30
              shadow-[0_20px_60px_rgba(0,0,0,0.25)]
              transition-all
              duration-500
              hover:border-blue-400/50
            "
          >
            <Image
              src="/imagens/sistema.png"
              alt="Sistema de monitoramento de consumo de água com sensor de fluxo, ESP32 e plataforma"
              width={1536}
              height={1024}
              className="h-auto w-full object-cover"
            />
          </div>
        </Reveal>

        {/* TEXTO */}
        <Reveal delay={200} className="order-1 lg:order-2">
          <div>
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
              Sobre o projeto
            </p>

            <h2
              className="
                text-3xl
                font-medium
                uppercase
                sm:text-4xl
              "
            >
              Tecnologia para um consumo mais consciente
            </h2>

            <p className="mt-6 leading-8 text-slate-300/80">
              Este projeto apresenta uma plataforma para o acompanhamento do
              consumo residencial de água utilizando Internet das Coisas (IoT).
              O sistema coleta informações de vazão e consumo e disponibiliza
              esses dados de forma simples e acessível para o usuário.
            </p>

            <p className="mt-4 leading-8 text-slate-300/80">
              A proposta é facilitar a identificação de padrões de consumo,
              desperdícios e possíveis anomalias, oferecendo informações que
              auxiliem no uso mais eficiente da água.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
