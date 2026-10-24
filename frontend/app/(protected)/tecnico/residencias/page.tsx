"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: "USUARIO" | "TECNICO";
}

interface Residencia {
  id: string;
  nome: string;
  endereco: string;
  usuario: Usuario;
}

const API_URL = "http://localhost:8080/api";

const estiloOpcao =
  "cursor-pointer text-slate-200 " +
  "hover:!bg-blue-500/20 hover:!text-white " +
  "focus:!bg-blue-500/20 focus:!text-white " +
  "data-[highlighted]:!bg-blue-500/20 " +
  "data-[highlighted]:!text-white";

export default function ResidenciasPage() {
  const [clientes, setClientes] = useState<Usuario[]>([]);
  const [residencias, setResidencias] = useState<Residencia[]>([]);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [residenciaEditando, setResidenciaEditando] =
    useState<Residencia | null>(null);

  const [nome, setNome] = useState("");
  const [endereco, setEndereco] = useState("");
  const [usuarioId, setUsuarioId] = useState("");

  const [salvando, setSalvando] = useState(false);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const [confirmacao, setConfirmacao] = useState<Residencia | null>(null);
  const [filtroCliente, setFiltroCliente] = useState("TODOS");

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Sessão não encontrada. Faça login novamente.");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const respostaUsuarios = await fetch(`${API_URL}/usuarios`, {
        headers,
      });

      if (!respostaUsuarios.ok) {
        throw new Error(
          respostaUsuarios.status === 401
            ? "Sua sessão expirou. Entre novamente."
            : respostaUsuarios.status === 403
              ? "Você não tem permissão para acessar esta página."
              : "Não foi possível carregar os clientes.",
        );
      }

      const usuarios: Usuario[] = await respostaUsuarios.json();

      const listaClientes = usuarios.filter(
        (usuario) => usuario.role === "USUARIO",
      );

      setClientes(listaClientes);

      const resultados = await Promise.all(
        listaClientes.map(async (cliente) => {
          const resposta = await fetch(
            `${API_URL}/residencias/usuario/${cliente.id}`,
            { headers },
          );

          if (!resposta.ok) {
            throw new Error(
              `Não foi possível carregar as residências de ${cliente.nome}.`,
            );
          }

          const lista: Omit<Residencia, "usuario">[] = await resposta.json();

          return lista.map((residencia) => ({
            ...residencia,
            usuario: cliente,
          }));
        }),
      );

      setResidencias(resultados.flat());
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao carregar os dados.",
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  function abrirCadastro() {
    setResidenciaEditando(null);
    setNome("");
    setEndereco("");
    setUsuarioId(clientes[0]?.id ?? "");
    setErro("");
    setSucesso("");
    setModalAberto(true);
  }

  function abrirEdicao(residencia: Residencia) {
    setResidenciaEditando(residencia);
    setNome(residencia.nome);
    setEndereco(residencia.endereco);
    setUsuarioId(residencia.usuario.id);
    setErro("");
    setSucesso("");
    setModalAberto(true);
  }

  async function salvarResidencia(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setSucesso("");

    if (!nome.trim() || !endereco.trim()) {
      setErro("Preencha o nome e o endereço da residência.");
      return;
    }

    if (!residenciaEditando && !usuarioId) {
      setErro("Selecione um cliente para a residência.");
      return;
    }

    setSalvando(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Sessão não encontrada. Faça login novamente.");
      }

      const endpoint = residenciaEditando
        ? `${API_URL}/residencias/${residenciaEditando.id}`
        : `${API_URL}/residencias/usuario/${usuarioId}`;

      const resposta = await fetch(endpoint, {
        method: residenciaEditando ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: nome.trim(),
          endereco: endereco.trim(),
        }),
      });

      if (!resposta.ok) {
        const mensagem = await resposta.text();

        throw new Error(
          mensagem ||
            `Não foi possível salvar a residência (HTTP ${resposta.status}).`,
        );
      }

      setModalAberto(false);
      setSucesso(
        residenciaEditando
          ? "Residência atualizada com sucesso."
          : "Residência cadastrada com sucesso.",
      );

      await carregarDados();
    } catch (error) {
      setErro(
        error instanceof Error ? error.message : "Erro ao salvar a residência.",
      );
    } finally {
      setSalvando(false);
    }
  }

  async function excluirResidencia() {
    if (!confirmacao || excluindoId) return;

    const residencia = confirmacao;

    setErro("");
    setSucesso("");
    setExcluindoId(residencia.id);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Sessão não encontrada. Faça login novamente.");
      }

      const resposta = await fetch(`${API_URL}/residencias/${residencia.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!resposta.ok) {
        const mensagem = await resposta.text();

        throw new Error(
          mensagem ||
            `Não foi possível excluir a residência (HTTP ${resposta.status}). Verifique se existem dispositivos vinculados.`,
        );
      }

      setConfirmacao(null);
      await carregarDados();
      setSucesso("Residência excluída com sucesso.");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao excluir a residência.",
      );
    } finally {
      setExcluindoId(null);
    }
  }

  const residenciasFiltradas =
    filtroCliente === "TODOS"
      ? residencias
      : residencias.filter(
          (residencia) => residencia.usuario.id === filtroCliente,
        );

  return (
    <main className="min-h-screen bg-[#020b24] px-4 py-8 text-white sm:px-6 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-blue-400">
            Administração
          </p>

          <h1 className="text-3xl font-bold md:text-4xl">
            Gerenciamento de residências
          </h1>

          <p className="mt-3 text-sm text-slate-400 md:text-base">
            Gerencie as residências e seus respectivos clientes.
          </p>
        </div>

        {sucesso && (
          <div className="mb-5 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300">
            {sucesso}
          </div>
        )}

        {erro && !modalAberto && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {erro}
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-blue-900/60 bg-[#07142f] shadow-xl">
          <div className="flex flex-col gap-4 border-b border-blue-900/60 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-lg font-semibold">Residências cadastradas</h2>

              {!carregando && (
                <p className="mt-1 text-sm text-slate-400">
                  {residenciasFiltradas.length}{" "}
                  {residenciasFiltradas.length === 1
                    ? "residência encontrada"
                    : "residências encontradas"}
                </p>
              )}
            </div>

            <button
              onClick={abrirCadastro}
              disabled={clientes.length === 0}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              + Nova residência
            </button>
          </div>

          <div className="flex flex-col gap-2 border-b border-blue-900/40 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
            <label htmlFor="filtro-cliente" className="text-sm text-slate-400">
              Filtrar por cliente:
            </label>

            <Select
              value={filtroCliente}
              onValueChange={(valor) => {
                if (valor !== null) {
                  setFiltroCliente(valor);
                }
              }}
            >
              <SelectTrigger
                id="filtro-cliente"
                className="
      h-12! w-full cursor-pointer
      rounded-xl border border-blue-400/20
      bg-[#020b24] px-4 text-sm text-slate-100
      shadow-none
      hover:border-blue-400/40
      focus-visible:border-blue-400
      sm:w-72
    "
              >
                <SelectValue>
                  {filtroCliente === "TODOS"
                    ? "Todos os clientes"
                    : (clientes.find((cliente) => cliente.id === filtroCliente)
                        ?.nome ?? "Selecione um cliente")}
                </SelectValue>
              </SelectTrigger>

              <SelectContent
                align="start"
                side="bottom"
                sideOffset={6}
                alignItemWithTrigger={false}
                className="
      max-h-60 rounded-xl
      border border-blue-400/20
      bg-[#07142f] p-1 text-slate-100
      shadow-xl shadow-black/40
    "
              >
                <SelectItem value="TODOS" className={estiloOpcao}>
                  Todos os clientes
                </SelectItem>

                {clientes.map((cliente) => (
                  <SelectItem
                    key={cliente.id}
                    value={cliente.id}
                    className={estiloOpcao}
                  >
                    {cliente.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {carregando ? (
            <div className="px-6 py-12 text-center text-slate-400">
              Carregando residências...
            </div>
          ) : residenciasFiltradas.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-slate-300">
                {clientes.length === 0
                  ? "Nenhum cliente cadastrado."
                  : filtroCliente === "TODOS"
                    ? "Nenhuma residência cadastrada."
                    : "Este cliente não possui residências cadastradas."}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                {clientes.length > 0
                  ? "Utilize o botão acima para cadastrar uma residência."
                  : "Cadastre um cliente antes de adicionar uma residência."}
              </p>
            </div>
          ) : (
            <>
              <div
                className="
    hidden overflow-x-auto md:block
    scrollbar-thin
    [scrollbar-color:#3b82f6_#07142f]
    [&::-webkit-scrollbar]:h-1.5
    [&::-webkit-scrollbar-track]:bg-[#07142f]
    [&::-webkit-scrollbar-thumb]:rounded-full
    [&::-webkit-scrollbar-thumb]:bg-blue-500
    [&::-webkit-scrollbar-thumb:hover]:bg-blue-400
  "
              >
                <table className="w-full text-left">
                  <thead className="bg-[#0b1c3b] text-sm text-slate-400">
                    <tr>
                      <th className="px-6 py-4 font-medium">Residência</th>
                      <th className="px-6 py-4 font-medium">Endereço</th>
                      <th className="px-6 py-4 font-medium">Cliente</th>
                      <th className="px-6 py-4 font-medium">Ações</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-blue-900/40">
                    {residenciasFiltradas.map((residencia) => (
                      <tr
                        key={residencia.id}
                        className="transition hover:bg-blue-950/40"
                      >
                        <td className="px-6 py-4 font-medium">
                          {residencia.nome}
                        </td>

                        <td className="px-6 py-4 text-slate-300">
                          {residencia.endereco}
                        </td>

                        <td className="px-6 py-4">
                          <div>{residencia.usuario.nome}</div>
                          <div className="mt-1 text-xs text-slate-500">
                            {residencia.usuario.email}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex gap-3">
                            <button
                              onClick={() => abrirEdicao(residencia)}
                              className="text-sm font-medium text-blue-300 hover:text-blue-200 cursor-pointer"
                            >
                              Editar
                            </button>

                            <button
                              onClick={() => {
                                setErro("");
                                setConfirmacao(residencia);
                              }}
                              disabled={excluindoId === residencia.id}
                              className="text-sm font-medium text-red-400 hover:text-red-300 disabled:opacity-50 cursor-pointer"
                            >
                              {excluindoId === residencia.id
                                ? "Excluindo..."
                                : "Excluir"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 p-4 md:hidden">
                {residenciasFiltradas.map((residencia) => (
                  <article
                    key={residencia.id}
                    className="rounded-xl border border-blue-900/50 bg-[#091a38] p-4"
                  >
                    <h3 className="font-semibold">{residencia.nome}</h3>

                    <p className="mt-2 text-sm text-slate-300">
                      {residencia.endereco}
                    </p>

                    <div className="mt-4 border-t border-blue-900/40 pt-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Cliente responsável
                      </p>
                      <p className="mt-1 font-medium">
                        {residencia.usuario.nome}
                      </p>
                      <p className="mt-1 break-all text-sm text-slate-400">
                        {residencia.usuario.email}
                      </p>
                    </div>

                    <div className="mt-4 flex gap-4">
                      <button
                        onClick={() => abrirEdicao(residencia)}
                        className="text-sm text-blue-300 cursor-pointer"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => {
                          setErro("");
                          setConfirmacao(residencia);
                        }}
                        disabled={excluindoId === residencia.id}
                        className="text-sm text-red-400 disabled:opacity-50 cursor-pointer"
                      >
                        {excluindoId === residencia.id
                          ? "Excluindo..."
                          : "Excluir"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
        <footer className="mt-8 flex flex-col items-center justify-center gap-2 border-t border-blue-400/10 py-6 text-center text-xs text-slate-500">
          <p>Monitoramento inteligente de água</p>
          <p>Projeto de TCC · 2026</p>
        </footer>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-titulo"
            className="my-auto w-full max-w-lg rounded-2xl border border-blue-900/70 bg-[#07142f] p-6 shadow-2xl sm:p-8"
          >
            <h2 id="modal-titulo" className="text-2xl font-bold">
              {residenciaEditando ? "Editar residência" : "Nova residência"}
            </h2>

            <p className="mb-6 mt-2 text-sm text-slate-400">
              {residenciaEditando
                ? "Atualize o nome e o endereço."
                : "Preencha os dados e selecione o cliente responsável."}
            </p>

            <form onSubmit={salvarResidencia} className="space-y-5">
              <div>
                <label
                  htmlFor="nome-residencia"
                  className="mb-2 block text-sm text-slate-300"
                >
                  Nome da residência
                </label>

                <input
                  id="nome-residencia"
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  required
                  maxLength={150}
                  className="w-full rounded-lg border border-blue-900 bg-[#020b24] px-4 py-3 text-white outline-none focus:border-blue-500"
                  placeholder="Ex.: Casa principal"
                />
              </div>

              <div>
                <label
                  htmlFor="endereco"
                  className="mb-2 block text-sm text-slate-300"
                >
                  Endereço completo
                </label>

                <input
                  id="endereco"
                  value={endereco}
                  onChange={(event) => setEndereco(event.target.value)}
                  required
                  maxLength={255}
                  className="w-full rounded-lg border border-blue-900 bg-[#020b24] px-4 py-3 text-white outline-none focus:border-blue-500"
                  placeholder="Rua, número, bairro, cidade..."
                />
              </div>

              <div>
                <label
                  htmlFor="cliente"
                  className="mb-2 block text-sm text-slate-300"
                >
                  Cliente responsável
                </label>

                <Select
                  value={usuarioId || null}
                  disabled={Boolean(residenciaEditando)}
                  onValueChange={(valor) => {
                    setUsuarioId(valor ?? "");
                  }}
                >
                  <SelectTrigger
                    id="cliente"
                    className="
      h-12! w-full cursor-pointer
      rounded-xl border border-blue-400/20
      bg-[#020b24] px-4 text-sm text-slate-100
      shadow-none
      hover:border-blue-400/40
      focus-visible:border-blue-400
      disabled:cursor-not-allowed
      disabled:opacity-70
    "
                  >
                    <SelectValue>
                      {usuarioId
                        ? (() => {
                            const cliente = clientes.find(
                              (item) => item.id === usuarioId,
                            );

                            return cliente
                              ? `${cliente.nome} — ${cliente.email}`
                              : "Selecione um cliente";
                          })()
                        : "Selecione um cliente"}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent
                    align="start"
                    side="bottom"
                    sideOffset={6}
                    alignItemWithTrigger={false}
                    className="
      max-h-60 rounded-xl
      border border-blue-400/20
      bg-[#07142f] p-1 text-slate-100
      shadow-xl shadow-black/40
    "
                  >
                    {clientes.map((cliente) => (
                      <SelectItem
                        key={cliente.id}
                        value={cliente.id}
                        className={estiloOpcao}
                      >
                        {cliente.nome} — {cliente.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {residenciaEditando && (
                  <p className="mt-2 text-xs text-slate-500">
                    O cliente vinculado não pode ser alterado nesta edição.
                  </p>
                )}
              </div>

              {erro && modalAberto && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                  {erro}
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setModalAberto(false);
                    setErro("");
                  }}
                  disabled={salvando}
                  className="rounded-lg border border-blue-900 px-5 py-3 text-sm text-slate-300 transition hover:bg-blue-950 disabled:opacity-50 cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={salvando || clientes.length === 0}
                  className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  {salvando
                    ? "Salvando..."
                    : residenciaEditando
                      ? "Salvar alterações"
                      : "Cadastrar residência"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {confirmacao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-confirmacao"
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#07132e] p-6 shadow-2xl"
          >
            <h2
              id="titulo-confirmacao"
              className="text-xl font-bold text-white"
            >
              Excluir residência?
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Você está prestes a excluir a residência{" "}
              <strong className="text-white">{confirmacao.nome}</strong>,
              vinculada ao cliente{" "}
              <strong className="text-white">{confirmacao.usuario.nome}</strong>
              . Essa ação não poderá ser desfeita.
            </p>

            {erro && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
              >
                {erro}
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setConfirmacao(null);
                  setErro("");
                }}
                disabled={excluindoId !== null}
                className="cursor-pointer rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={excluirResidencia}
                disabled={excluindoId !== null}
                className="cursor-pointer rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {excluindoId !== null ? "Excluindo..." : "Confirmar exclusão"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
