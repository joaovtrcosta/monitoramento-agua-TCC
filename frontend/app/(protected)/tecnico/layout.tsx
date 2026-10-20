
"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Activity,
  Cpu,
  Droplets,
  House,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";

const secoes = [
  {
    titulo: "Visão geral",
    href: "/tecnico",
    icon: LayoutDashboard,
  },
  {
    titulo: "Clientes",
    href: "/tecnico/clientes",
    icon: Users,
  },
  {
    titulo: "Residências",
    href: "/tecnico/residencias",
    icon: House,
  },
  {
    titulo: "Dispositivos",
    href: "/tecnico/dispositivos",
    icon: Cpu,
  },
];

export default function TecnicoLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);

  function renderNavegacao(mobile = false) {
    return (
      <>
        <Link
          href="/tecnico"
          onClick={() => setMenuAberto(false)}
          className="flex items-center gap-3 p-2"
        >
          <div className="rounded-xl bg-blue-500/15 p-2.5 text-blue-400">
            <Droplets size={25} />
          </div>

          <div>
            <h1 className="font-semibold">Monitoramento</h1>
            <p className="text-xs text-slate-400">Sistema de Água</p>
          </div>
        </Link>

        <p className="mb-3 mt-10 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Administração
        </p>

        <nav className="space-y-2">
          {secoes.map((secao) => {
            const Icon = secao.icon;
            const ativo =
              secao.href === "/tecnico"
                ? pathname === "/tecnico"
                : pathname.startsWith(secao.href);

            return (
              <Link
                key={secao.href}
                href={secao.href}
                onClick={() => setMenuAberto(false)}
                aria-current={ativo ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition ${
                  ativo
                    ? "border-blue-400/20 bg-blue-500/10 text-blue-300"
                    : "border-transparent text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={19} />
                <span className="text-sm">{secao.titulo}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/10 pt-5">
          <Link
            href="/login"
            onClick={() => setMenuAberto(false)}
            className="mt-2 flex items-center gap-3 rounded-xl px-4 py-3 text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <LogOut size={19} />
            <span className="text-sm">Sair</span>
          </Link>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#020b24] text-white">
      {/* Sidebar do computador */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/10 bg-[#030d29] p-5 lg:flex">
        {renderNavegacao()}
      </aside>

      {/* Fundo escuro do menu mobile */}
      {menuAberto && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setMenuAberto(false)}
          className="fixed inset-0 z-40 cursor-pointer bg-black/60 lg:hidden"
        />
      )}

      {/* Menu lateral do celular */}
      <aside
        id="menu-tecnico-mobile"
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col border-r border-white/10 bg-[#030d29] p-5 transition-transform duration-300 lg:hidden ${
          menuAberto ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Navegação administrativa"
        aria-hidden={!menuAberto}
      >
        <div className="mb-5 flex items-center justify-end">
          <button
            type="button"
            onClick={() => setMenuAberto(false)}
            aria-label="Fechar menu"
            className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <X size={23} />
          </button>
        </div>

        {renderNavegacao(true)}
      </aside>

      {/* Conteúdo principal */}
      <div className="min-h-screen lg:pl-64">
        <header className="flex min-h-20 items-center gap-4 border-b border-white/10 px-4 py-4 sm:px-8 lg:px-10">
          {/* Botão hambúrguer: somente no celular */}
          <button
            type="button"
            onClick={() => setMenuAberto(true)}
            aria-label="Abrir menu"
            aria-controls="menu-tecnico-mobile"
            aria-expanded={menuAberto}
            className="shrink-0 rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-200 transition hover:bg-white/10 lg:hidden"
          >
            <Menu size={22} />
          </button>

          <div className="min-w-0">
            <p className="text-sm text-slate-400">
              Área administrativa
            </p>
            <h2 className="text-lg font-semibold">
              Painel do técnico
            </h2>
          </div>
        </header>

        <main className="mx-auto w-full max-w-362.5 p-4 sm:p-8 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
