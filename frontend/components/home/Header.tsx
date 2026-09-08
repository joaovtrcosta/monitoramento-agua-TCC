import Link from "next/link";
import { Droplets } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Header() {
  return (
    <header className="absolute left-0 top-0 z-50 w-full px-6 py-5">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-white">
          <Droplets className="h-7 w-7 text-blue-400" />

          <span className="hidden text-lg font-semibold sm:block">
            Monitoramento de Água
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="#inicio"
            className="
            relative
            text-sm
            text-slate-300
            transition-colors
            duration-300
          hover:text-blue-400

            after:absolute
            after:-bottom-2
            after:left-0
            after:h-0.5
            after:w-full
            after:origin-left
            after:scale-x-0
          after:bg-blue-400
            after:transition-transform
            after:duration-300
            after:ease-out

            hover:after:scale-x-100
          "
          >
            Início
          </Link>

          <Link
            href="#sobre"
            className="
            relative
            text-sm
          text-slate-300
            transition-colors
            duration-300
          hover:text-blue-400

            after:absolute
            after:-bottom-2
            after:left-0
            after:h-0.5
            after:w-full
            after:origin-left
            after:scale-x-0
          after:bg-blue-400
            after:transition-transform
            after:duration-300
            after:ease-out

            hover:after:scale-x-100
          "
          >
            Sobre
          </Link>

          <Link
            href="#funcionamento"
            className="
            relative
            text-sm
          text-slate-300
            transition-colors
            duration-300
          hover:text-blue-400

            after:absolute
            after:-bottom-2
            after:left-0
            after:h-0.5
            after:w-full
            after:origin-left
            after:scale-x-0
          after:bg-blue-400
            after:transition-transform
            after:duration-300
            after:ease-out

            hover:after:scale-x-100
            "
          >
            Como funciona
          </Link>

          <Link
            href="#beneficios"
            className="
            relative
            text-sm
          text-slate-300
            transition-colors
            duration-300
          hover:text-blue-400

            after:absolute
            after:-bottom-2
            after:left-0
            after:h-0.5
            after:w-full
            after:origin-left
            after:scale-x-0
          after:bg-blue-400
            after:transition-transform
            fter:duration-300
            after:ease-out

            hover:after:scale-x-100
          "
          >
            Benefícios
          </Link>
        </nav>

        <Link
          href="/login"
          className={cn(
            buttonVariants(),
            "h-10 border border-blue-600 bg-blue-600 px-6 text-sm text-white",
            "shadow-[0_0_20px_rgba(37,99,235,0.25)]",
            "transition-all duration-700 ease-in-out",
            "hover:border-blue-400 hover:bg-transparent hover:text-blue-400",
          )}
        >
          Entrar
        </Link>
      </div>
    </header>
  );
}
