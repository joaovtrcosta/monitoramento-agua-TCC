"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Cpu,
  Droplets,
  House,
  LayoutDashboard,
  LogOut,
  Users,
} from "lucide-react";

const secoes = [
  {
    titulo: "Clientes",
    descricao: "Cadastre e gerencie os usuários do sistema.",
    detalhe: "Gerenciamento de usuários",
    href: "/tecnico/clientes",
    icon: Users,
  },
  {
    titulo: "Residências",
    descricao: "Gerencie as residências vinculadas aos clientes.",
    detalhe: "Cadastro de residências",
    href: "/tecnico/residencias",
    icon: House,
  },
  {
    titulo: "Dispositivos",
    descricao: "Cadastre ESP32 e vincule cada dispositivo a uma residência.",
    detalhe: "Gerenciamento de dispositivos IoT",
    href: "/tecnico/dispositivos",
    icon: Cpu,
  },
];

export default function TecnicoPage() {
  return (
    <main className="min-h-screen bg-[#020b24] text-white">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-white/10 bg-[#030d29] p-6 lg:flex lg:flex-col">
        <Link href="/" className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-500/15 p-2 text-blue-400">
            <Droplets size={25} />
          </div>

          <div>
            <h1 className="font-semibold">Monitoramento</h1>
            <p className="text-xs text-slate-400">Sistema de Água</p>
          </div>
        </Link>

        <p className="mb-3 mt-10 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Administração
        </p>

        <nav className="space-y-2">
          <Link
            href="/tecnico"
            className="flex items-center gap-3 rounded-xl border border-blue-400/20 bg-blue-500/10 px-4 py-3 text-blue-300"
          >
            <LayoutDashboard size={19} />
            <span className="text-sm font-medium">Visão geral</span>
          </Link>

          {secoes.map((secao) => {
            const Icon = secao.icon;

            return (
              <Link
                key={secao.href}
                href={secao.href}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                <Icon size={19} />
                <span className="text-sm">{secao.titulo}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/10 pt-5">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <Activity size={19} />
            <span className="text-sm">Dashboard do usuário</span>
          </Link>

          <Link
            href="/login"
            className="mt-2 flex items-center gap-3 rounded-xl px-4 py-3 text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <LogOut size={19} />
            <span className="text-sm">Sair</span>
          </Link>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-64">
        <header className="flex h-20 items-center justify-between border-b border-white/10 px-6 sm:px-10">
          <div>
            <p className="text-sm text-slate-400">
              Área administrativa
            </p>
            <h2 className="text-lg font-semibold">
              Painel do técnico
            </h2>
          </div>

          <div className="rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-medium text-blue-300">
            Técnico
          </div>
        </header>

        <div className="mx-auto max-w-7xl p-6 sm:p-10">
          <section className="mb-10">
            <p className="mb-3 text-sm font-medium text-blue-400">
              MONITORAMENTO DE ÁGUA
            </p>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Área de gerenciamento
            </h1>

            <p className="mt-3 max-w-2xl leading-7 text-slate-400">
              Gerencie clientes, residências e dispositivos IoT
              em um só lugar. Acompanhe a organização dos equipamentos
              utilizados no monitoramento do consumo de água.
            </p>
          </section>

          <section>
            <div className="mb-5">
              <h3 className="text-lg font-semibold">
                Gerenciamento do sistema
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Selecione uma área para continuar.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {secoes.map((secao) => {
                const Icon = secao.icon;

                return (
                  <Link
                    key={secao.href}
                    href={secao.href}
                    className="group rounded-2xl border border-white/10 bg-white/3 p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-400/30 hover:bg-blue-500/5"
                  >
                    <div className="mb-6 flex items-center justify-between">
                      <div className="rounded-xl border border-blue-400/15 bg-blue-500/10 p-3 text-blue-400">
                        <Icon size={25} />
                      </div>

                      <ArrowRight
                        size={20}
                        className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-blue-400"
                      />
                    </div>

                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-blue-400">
                      {secao.detalhe}
                    </p>

                    <h4 className="text-xl font-semibold">
                      {secao.titulo}
                    </h4>

                    <p className="mt-3 min-h-12 text-sm leading-6 text-slate-400">
                      {secao.descricao}
                    </p>

                    <div className="mt-6 border-t border-white/10 pt-4 text-sm font-medium text-slate-300 transition group-hover:text-blue-300">
                      Acessar área
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <footer className="mt-12 border-t border-white/10 py-6 text-center text-xs text-slate-500">
            Monitoramento inteligente de água · Projeto de TCC 2026
          </footer>
        </div>
      </div>
    </main>
  );
}