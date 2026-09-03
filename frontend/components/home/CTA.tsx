import Link from "next/link";
import Reveal from "@/components/shared/Reveal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CTA() {
  return (
    <section className="relative bg-transparent px-6 py-32">
      <Reveal>
        <div className="mx-auto max-w-5xl rounded-3xl border border-blue-400/20 bg-[linear-gradient(135deg,rgba(8,35,68,0.8),rgba(4,19,43,0.8))] px-8 py-14 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_25px_70px_rgba(0,0,0,0.25)] backdrop-blur-xl">
          <h2 className="text-3xl font-medium uppercase">
            Comece a acompanhar seu consumo
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-slate-300/70">
            Acesse a plataforma e tenha uma visão mais clara sobre o consumo de
            água da sua residência.
          </p>

          <Link
            href="/login"
            className={cn(
              buttonVariants(),
              "h-14 border mt-8 border-blue-600 bg-blue-600 px-8 text-base text-white",
              "shadow-[0_0_25px_rgba(37,99,235,0.30)]",
              "transition-all duration-700 ease-in-out",
              "hover:border-blue-400 hover:bg-transparent hover:text-blue-400",
            )}
          >
            Acessar plataforma
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
