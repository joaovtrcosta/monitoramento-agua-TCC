"use client";

import { useCallback, useEffect, useState } from "react";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: "USUARIO" | "TECNICO";
}

const API_URL = "http://localhost:8080/api/usuarios";

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Usuario | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const carregarClientes = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setErro("Sessão não encontrada. Faça login novamente.");
        return;
      }

      const resposta = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!resposta.ok) {
        throw new Error(
          resposta.status === 401
            ? "Sua sessão expirou. Entre novamente."
            : resposta.status === 403
              ? "Você não tem permissão para acessar os clientes."
              : "Não foi possível carregar os clientes."
        );
      }

      const usuarios: Usuario[] = await resposta.json();

      setClientes(usuarios.filter((usuario) => usuario.role === "USUARIO"));
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao carregar os clientes."
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarClientes();
  }, [carregarClientes]);

  function abrirCadastro() {
    setClienteEditando(null);
    setNome("");
    setEmail("");
    setSenha("");
    setErro("");
    setSucesso("");
    setModalAberto(true);
  }

  function abrirEdicao(cliente: Usuario) {
    setClienteEditando(cliente);
    setNome(cliente.nome);
    setEmail(cliente.email);
    setSenha("");
    setErro("");
    setSucesso("");
    setModalAberto(true);
  }

  async function salvarCliente(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setSucesso("");

    if (!nome.trim() || !email.trim()) {
      setErro("Preencha o nome e o e-mail.");
      return;
    }

    if (!clienteEditando && senha.length < 6) {
      setErro("A senha deve possuir pelo menos 6 caracteres.");
      return;
    }

    if (senha && senha.length < 6) {
      setErro("A nova senha deve possuir pelo menos 6 caracteres.");
      return;
    }

    setSalvando(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Sessão não encontrada. Faça login novamente.");
      }

      const corpo: { nome: string; email: string; senha?: string } = {
        nome: nome.trim(),
        email: email.trim(),
      };

      if (senha) {
        corpo.senha = senha;
      }

      const resposta = await fetch(
        clienteEditando ? `${API_URL}/${clienteEditando.id}` : API_URL,
        {
          method: clienteEditando ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(corpo),
        }
      );

      if (!resposta.ok) {
        const mensagem = await resposta.text();
        throw new Error(
          mensagem || `Não foi possível salvar o cliente (HTTP ${resposta.status}).`
        );
      }

      setModalAberto(false);
      setSucesso(
        clienteEditando
          ? "Cliente atualizado com sucesso."
          : "Cliente cadastrado com sucesso."
      );

      await carregarClientes();
    } catch (error) {
      setErro(
        error instanceof Error ? error.message : "Erro ao salvar o cliente."
      );
    } finally {
      setSalvando(false);
    }
  }

  async function excluirCliente(cliente: Usuario) {
    const confirmou = window.confirm(
      `Deseja realmente excluir o cliente ${cliente.nome}?`
    );

    if (!confirmou) return;

    setErro("");
    setSucesso("");
    setExcluindoId(cliente.id);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Sessão não encontrada. Faça login novamente.");
      }

      const resposta = await fetch(`${API_URL}/${cliente.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!resposta.ok) {
        const mensagem = await resposta.text();

        throw new Error(
          mensagem ||
            (resposta.status === 409
              ? "Não é possível excluir um cliente que possui residências."
              : `Não foi possível excluir o cliente (HTTP ${resposta.status}).`)
        );
      }

      setSucesso("Cliente excluído com sucesso.");
      await carregarClientes();
    } catch (error) {
      setErro(
        error instanceof Error ? error.message : "Erro ao excluir o cliente."
      );
    } finally {
      setExcluindoId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#020b24] px-4 py-8 text-white sm:px-6 md:px-10">
      <div className="mx-auto max-w-6xl">
        
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-blue-400">
            Administração
          </p>

          <h1 className="text-3xl font-bold md:text-4xl">
            Gerenciamento de clientes
          </h1>

          <p className="mt-3 text-sm text-slate-400 md:text-base">
            Cadastre, consulte, edite e remova clientes do sistema.
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
              <h2 className="text-lg font-semibold">Clientes cadastrados</h2>
              {!carregando && (
                <p className="mt-1 text-sm text-slate-400">
                  {clientes.length}{" "}
                  {clientes.length === 1 ? "cliente encontrado" : "clientes encontrados"}
                </p>
              )}
            </div>

            <button
              onClick={abrirCadastro}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold transition hover:bg-blue-500 cursor-pointer"
            >
              + Novo cliente
            </button>
          </div>

          {carregando ? (
            <div className="px-6 py-12 text-center text-slate-400">
              Carregando clientes...
            </div>
          ) : clientes.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-slate-300">Nenhum cliente cadastrado.</p>
              <p className="mt-2 text-sm text-slate-500">
                Utilize o botão acima para cadastrar o primeiro cliente.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead className="bg-[#0b1c3b] text-sm text-slate-400">
                    <tr>
                      <th className="px-6 py-4 font-medium">Nome</th>
                      <th className="px-6 py-4 font-medium">E-mail</th>
                      <th className="px-6 py-4 font-medium">Perfil</th>
                      <th className="px-6 py-4 font-medium">Ações</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-blue-900/40">
                    {clientes.map((cliente) => (
                      <tr key={cliente.id} className="hover:bg-blue-950/40">
                        <td className="px-6 py-4 font-medium">{cliente.nome}</td>
                        <td className="px-6 py-4 text-slate-300">{cliente.email}</td>
                        <td className="px-6 py-4">
                          <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs text-blue-300">
                            Cliente
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-3">
                            <button
                              onClick={() => abrirEdicao(cliente)}
                              className="text-sm font-medium text-blue-300 hover:text-blue-200 cursor-pointer"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => excluirCliente(cliente)}
                              disabled={excluindoId === cliente.id}
                              className="text-sm font-medium text-red-400 hover:text-red-300 disabled:opacity-50 cursor-pointer"
                            >
                              {excluindoId === cliente.id ? "Excluindo..." : "Excluir"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 p-4 md:hidden">
                {clientes.map((cliente) => (
                  <article
                    key={cliente.id}
                    className="rounded-xl border border-blue-900/50 bg-[#091a38] p-4"
                  >
                    <h3 className="font-semibold">{cliente.nome}</h3>
                    <p className="mt-2 break-all text-sm text-slate-400">
                      {cliente.email}
                    </p>
                    <span className="mt-3 inline-block rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs text-blue-300">
                      Cliente
                    </span>
                    <div className="mt-4 flex gap-4">
                      <button
                        onClick={() => abrirEdicao(cliente)}
                        className="text-sm text-blue-300 cursor-pointer"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => excluirCliente(cliente)}
                        disabled={excluindoId === cliente.id}
                        className="text-sm text-red-400 disabled:opacity-50 "
                      >
                        {excluindoId === cliente.id ? "Excluindo..." : "Excluir"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
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
              {clienteEditando ? "Editar cliente" : "Novo cliente"}
            </h2>

            <p className="mb-6 mt-2 text-sm text-slate-400">
              {clienteEditando
                ? "Atualize os dados do cliente."
                : "Preencha os dados para cadastrar um cliente."}
            </p>

            <form onSubmit={salvarCliente} className="space-y-5">
              <div>
                <label htmlFor="nome" className="mb-2 block text-sm text-slate-300">
                  Nome completo
                </label>
                <input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  maxLength={150}
                  autoComplete="name"
                  className="w-full rounded-lg border border-blue-900 bg-[#020b24] px-4 py-3 text-white outline-none focus:border-blue-500"
                  placeholder="Digite o nome"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm text-slate-300">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={254}
                  autoComplete="email"
                  className="w-full rounded-lg border border-blue-900 bg-[#020b24] px-4 py-3 text-white outline-none focus:border-blue-500"
                  placeholder="cliente@email.com"
                />
              </div>

              <div>
                <label htmlFor="senha" className="mb-2 block text-sm text-slate-300">
                  Senha {clienteEditando ? "(opcional)" : ""}
                </label>
                <input
                  id="senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required={!clienteEditando}
                  minLength={6}
                  autoComplete={clienteEditando ? "new-password" : "new-password"}
                  className="w-full rounded-lg border border-blue-900 bg-[#020b24] px-4 py-3 text-white outline-none focus:border-blue-500"
                  placeholder={
                    clienteEditando
                      ? "Deixe em branco para manter a senha atual"
                      : "Mínimo de 6 caracteres"
                  }
                />
              </div>

              {erro && (
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
                  disabled={salvando}
                  className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  {salvando
                    ? "Salvando..."
                    : clienteEditando
                      ? "Salvar alterações"
                      : "Cadastrar cliente"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}