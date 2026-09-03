import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Header() {
  return (
    <header className="absolute left-0 top-0 z-50 w-full px-6 py-5">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="text-xl font-bold text-white">
          Aqua<span className="text-blue-400">Monitor</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="#inicio"
            className="text-sm text-slate-300 transition hover:text-white"
          >
            Início
          </Link>

          <Link
            href="#sobre"
            className="text-sm text-slate-300 transition hover:text-white"
          >
            Sobre
          </Link>

          <Link
            href="#funcionamento"
            className="text-sm text-slate-300 transition hover:text-white"
          >
            Como funciona
          </Link>

          <Link
            href="#beneficios"
            className="text-sm text-slate-300 transition hover:text-white"
          >
            Benefícios
          </Link>
        </nav>

        <Link
          href="/login"
          className={cn(
            buttonVariants(),
            "bg-blue-600 text-white",
            "transition-all duration-700 ease-in-out",
            "hover:bg-transparent hover:text-blue-400",
          )}
        >
          Entrar
        </Link>
      </div>
    </header>
  );
}
