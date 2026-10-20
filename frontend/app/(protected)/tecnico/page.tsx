"use client";

import Link from "next/link";
import { ArrowRight, Cpu, Droplets, House, Plus, Users } from "lucide-react";

const secoes = [
  {
    titulo: "Clientes",
    descricao: "Cadastre usuários e gerencie seus acessos ao sistema.",
    detalhe: "Gestão de usuários",
    href: "/tecnico/clientes",
    icon: Users,
    acao: "Gerenciar clientes",
  },
  {
    titulo: "Residências",
    descricao: "Organize as residências e seus vínculos com os clientes.",
    detalhe: "Unidades monitoradas",
    href: "/tecnico/residencias",
    icon: House,
    acao: "Gerenciar residências",
  },
  {
    titulo: "Dispositivos",
    descricao: "Cadastre ESP32 e organize os dispositivos por residência.",
    detalhe: "Equipamentos IoT",
    href: "/tecnico/dispositivos",
    icon: Cpu,
    acao: "Gerenciar dispositivos",
  },
];

export default function TecnicoPage() {
  return (
    <>
      <section className="relative mb-10 overflow-hidden rounded-3xl border border-blue-400/15 bg-linear-to-br from-blue-500/12 via-[#081634] to-[#071027] p-6 sm:p-9">
        <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full bg-blue-500/8 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-blue-400">
              Monitoramento inteligente de água
            </p>

            <h1 className="text-3xl font-bold uppercase tracking-tight sm:text-4xl">
              Área de gerenciamento
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
              Gerencie clientes, residências e dispositivos IoT em um só lugar.
              Organize a estrutura do sistema e acompanhe os equipamentos
              utilizados no monitoramento de água.
            </p>
          </div>

          <div className="hidden h-28 w-28 shrink-0 items-center justify-center rounded-3xl border border-blue-400/15 bg-blue-500/[0.07] text-blue-400 md:flex">
            <Droplets size={56} strokeWidth={1.3} />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5">
          <h2 className="text-lg font-semibold">Gerenciamento</h2>
          <p className="mt-1 text-sm text-slate-400">
            Escolha uma área para consultar ou cadastrar informações.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {secoes.map((secao) => {
            const Icon = secao.icon;

            return (
              <Link
                key={secao.href}
                href={secao.href}
                className="group relative flex min-h-63.75 flex-col overflow-hidden rounded-2xl border border-white/8 bg-[#08142e]/70 p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-400/30 hover:bg-[#0a1938]"
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500/4 blur-2xl transition group-hover:bg-blue-500/10" />

                <div className="relative mb-6 flex items-center justify-between">
                  <div className="rounded-xl border border-blue-400/20 bg-blue-500/9 p-3 text-blue-400 transition group-hover:border-blue-400/30 group-hover:bg-blue-500/15">
                    <Icon size={25} strokeWidth={1.8} />
                  </div>

                  <ArrowRight
                    size={20}
                    className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-blue-400"
                  />
                </div>

                <div className="relative flex-1">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-400">
                    {secao.detalhe}
                  </p>

                  <h3 className="text-xl font-semibold tracking-tight">
                    {secao.titulo}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {secao.descricao}
                  </p>
                </div>

                <div className="relative mt-6 flex items-center justify-between border-t border-white/8 pt-4 text-sm font-medium text-slate-300 transition group-hover:text-blue-300">
                  {secao.acao}
                  <ArrowRight size={16} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <footer className="mt-12 border-t border-white/[0.07] py-6 text-center text-xs text-slate-500">
        Monitoramento inteligente de água · Projeto de TCC 2026
      </footer>
    </>
  );
}
