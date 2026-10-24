"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

import {
  Activity,
  AlertTriangle,
  BarChart3,
  CalendarDays,
  Droplets,
  FileBarChart,
  LogOut,
  Menu,
  TrendingUp,
  UserRound,
  X,
} from "lucide-react";

const itensMenu = [
  {
    nome: "Visão geral",
    href: "/dashboard",
    icone: Activity,
  },
  {
    nome: "Consumo diário",
    href: "/dashboard/consumo",
    icone: BarChart3,
  },
  {
    nome: "Histórico",
    href: "/dashboard/historico",
    icone: CalendarDays,
  },
  {
    nome: "Análise de consumo",
    href: "/dashboard/analises",
    icone: Activity,
  },
  {
    nome: "Previsão de consumo",
    href: "/dashboard/analises/previsao",
    icone: TrendingUp,
  },
  {
    nome: "Alertas e vazamentos",
    href: "/dashboard/alertas",
    icone: AlertTriangle,
  },
  {
    nome: "Relatórios",
    href: "/dashboard/relatorios",
    icone: FileBarChart,
  },
  {
    nome: "Meu perfil",
    href: "/dashboard/perfil",
    icone: UserRound,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [nome, setNome] = useState("");
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    function atualizarPerfil(event?: Event) {
      const evento = event as CustomEvent<{ nome?: string }> | undefined;

      const nomeSalvo = evento?.detail?.nome ?? localStorage.getItem("nome");

      setNome(nomeSalvo?.trim() ?? "");
    }

    atualizarPerfil();

    window.addEventListener("perfilAtualizado", atualizarPerfil);

    return () => {
      window.removeEventListener("perfilAtualizado", atualizarPerfil);
    };
  }, []);

  useEffect(() => {
    setMenuAberto(false);
  }, [pathname]);

  function sair() {
    localStorage.removeItem("token");
    localStorage.removeItem("nome");
    localStorage.removeItem("email");
    localStorage.removeItem("role");

    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-[#020b24] text-white">
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 flex w-64 flex-col
          border-r border-blue-400/10 bg-[#030d29]
          transition-transform duration-300
          lg:translate-x-0
          ${menuAberto ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-20 items-center justify-between border-b border-blue-400/10 px-5">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10">
              <Droplets className="h-6 w-6 text-blue-400" />
            </div>

            <span className="text-xs font-semibold">Monitoramento de Água</span>
          </Link>

          <button
            type="button"
            onClick={() => setMenuAberto(false)}
            className="text-slate-400 lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-7">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Menu principal
          </p>

          <div className="space-y-1">
            {itensMenu.map((item) => {
              const ativo = pathname === item.href;
              const Icone = item.icone;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 rounded-xl
                    border px-3 py-3 text-sm
                    transition-colors
                    ${
                      ativo
                        ? "border-blue-400/15 bg-blue-500/10 font-medium text-blue-400"
                        : "border-transparent text-slate-400 hover:bg-blue-500/10 hover:text-blue-300"
                    }
                  `}
                >
                  <Icone className="h-4 w-4 shrink-0" />
                  {item.nome}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-blue-400/10 p-4">
          <button
            type="button"
            onClick={sair}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            Sair da conta
          </button>
        </div>
      </aside>

      {menuAberto && (
        <button
          type="button"
          onClick={() => setMenuAberto(false)}
          aria-label="Fechar menu"
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
        />
      )}

      <div className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-blue-400/10 bg-[#030d29]/90 backdrop-blur-xl">
          <div className="flex min-h-20 items-center justify-between gap-4 px-5 sm:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMenuAberto(true)}
                aria-label="Abrir menu"
                className="rounded-lg p-2 text-blue-400 hover:bg-blue-500/10 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2 lg:hidden">
                <Droplets className="h-5 w-5 text-blue-400" />

                <span className="text-sm font-semibold">
                  Monitoramento de Água
                </span>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold uppercase">
                  {nome || "Usuário"}
                </p>

                <Link
                  href="/dashboard/perfil"
                  className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300"
                >
                  Meu perfil
                </Link>
              </div>

              <Link
                href="/dashboard/perfil"
                aria-label="Acessar meu perfil"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-400/20 bg-blue-500/10 font-semibold text-blue-400 hover:bg-blue-500/20"
              >
                {(nome || "U").charAt(0).toUpperCase()}
              </Link>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-375 p-5 sm:p-8">{children}</div>
      </div>
    </main>
  );
}
