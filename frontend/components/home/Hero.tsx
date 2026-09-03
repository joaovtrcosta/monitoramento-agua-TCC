import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Hero() {
  return (
    <section
      id="inicio"
      className="
        relative
        overflow-hidden
        bg-transparent
        px-6
        pt-28

        lg:min-h-screen
        lg:pt-20
      "
    >
      {/* BRILHOS */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-[-250px]
          h-[600px]
          w-[900px]
          -translate-x-1/2
          rounded-full
          bg-blue-400/10
          blur-[150px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          right-[-250px]
          top-[80px]
          h-[600px]
          w-[600px]
          rounded-full
          bg-cyan-500/10
          blur-[160px]
        "
      />

      {/* ARTE AO FUNDO - MOBILE */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-0
          overflow-hidden
          lg:hidden
        "
      >
        <Image
          src="/imagens/mao.png"
          alt=""
          width={1200}
          height={700}
          priority
          className="
            absolute
            top-[500px]
            right-[-80px]
            w-[500px]
            object-contain
            opacity-[0.12]

            sm:top-[470px]
            sm:right-[-70px]
            sm:w-[560px]
          "
        />

        <Image
          src="/imagens/icons.png"
          alt=""
          width={700}
          height={700}
          priority
          className="
            animacao-flutuar
            absolute
            top-[280px]
            right-[80px]
            w-[350px]
            object-contain
            opacity-25

            sm:top-[290px]
            sm:right-[120px]
            sm:w-[340px]
          "
        />
      </div>

      {/* CONTEÚDO */}

      <div
        className="
          relative
          z-10
          mx-auto
          grid
          min-h-[720px]
          max-w-7xl
          items-start
          pt-18

          sm:pt-14

          lg:min-h-[calc(100vh-80px)]
          lg:grid-cols-2
          lg:items-center
          lg:pt-0
        "
      >
        <div>
          <h1
            className="
      max-w-2xl
      text-5xl
      font-medium
      uppercase
      leading-tight

      sm:text-5xl
      lg:text-6xl
    "
          >
            Controle seu consumo de água de forma{" "}
            <span className="text-blue-400">inteligente.</span>
          </h1>

          <p
            className="
      mt-15
      max-w-xl
      text-base
      leading-7
      text-slate-300

      sm:mt-6
      sm:text-lg
      sm:leading-8
    "
          >
            Acompanhe o consumo de água da sua residência, visualize informações
            em tempo real, identifique desperdícios e tenha maior controle sobre
            seus gastos.
          </p>

          <div
            className="
      mt-19
      flex
      flex-wrap
      gap-4

      sm:mt-8
    "
          >
            <Link
              href="/login"
              className={cn(
                buttonVariants(),
                "h-14 border border-blue-600 bg-blue-600 px-8 text-base text-white",
                "shadow-[0_0_25px_rgba(37,99,235,0.30)]",
                "transition-all duration-700 ease-in-out",
                "hover:border-blue-400 hover:bg-transparent hover:text-blue-400",
              )}
            >
              Acessar plataforma
            </Link>
          </div>
        </div>

        <div />
      </div>

      {/* ARTE DESKTOP */}

      <Image
        src="/imagens/icons.png"
        alt="Monitoramento inteligente de água"
        width={700}
        height={700}
        priority
        className="
          animacao-flutuar
          pointer-events-none
          absolute
          bottom-[170px]
          right-[230px]
          z-30
          hidden
          w-[580px]
          object-contain
          lg:block
        "
      />

      <Image
        src="/imagens/mao.png"
        alt="Mão tecnológica"
        width={1200}
        height={700}
        priority
        className="
          pointer-events-none
          absolute
          bottom-[20px]
          right-[-80px]
          z-20
          hidden
          w-[850px]
          object-contain
          lg:block
        "
      />
    </section>
  );
}
