
"use client";

import { useCallback, useEffect, useState } from "react";

const API_URL = "http://localhost:8080/api";

type Cliente = {
  id: string;
  nome: string;
  email: string;
};

type Residencia = {
  id: string;
  nome: string;
  endereco: string;
  usuario: Cliente;
};

type Dispositivo = {
  id: string;
  deviceId: string;
  ativo: boolean;
  residenciaId: string;
  residenciaNome: string;
};

export default function DispositivosPage() {
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [residencias, setResidencias] = useState<Residencia[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Dispositivo | null>(null);

  const [deviceId, setDeviceId] = useState("");
  const [residenciaId, setResidenciaId] = useState("");

  const [filtro, setFiltro] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("TODOS");

  const [confirmacao, setConfirmacao] =
    useState<Dispositivo | null>(null);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const headers = useCallback((): HeadersInit => {
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, [token]);

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      if (!token) {
        throw new Error("Sessão não encontrada. Faça login novamente.");
      }

      const respostaClientes = await fetch(`${API_URL}/usuarios`, {
        headers: headers(),
      });

      if (!respostaClientes.ok) {
        throw new Error("Não foi possível carregar os clientes.");
      }

      const listaClientes: Cliente[] = await respostaClientes.json();
      setClientes(listaClientes);

      const respostasResidencias = await Promise.all(
        listaClientes.map(async (cliente) => {
          const resposta = await fetch(
            `${API_URL}/residencias/usuario/${cliente.id}`,
            { headers: headers() }
          );

          if (!resposta.ok) {
            throw new Error(
              `Não foi possível carregar as residências de ${cliente.nome}.`
            );
          }

          const lista: Omit<Residencia, "usuario">[] =
            await resposta.json();

          return lista.map((residencia) => ({
            ...residencia,
            usuario: cliente,
          }));
        })
      );

      const todasResidencias = respostasResidencias.flat();
      setResidencias(todasResidencias);

      const respostasDispositivos = await Promise.all(
        todasResidencias.map(async (residencia) => {
          const resposta = await fetch(
            `${API_URL}/dispositivos/residencia/${residencia.id}`,
            { headers: headers() }
          );

          if (!resposta.ok) {
            throw new Error(
              `Não foi possível carregar os dispositivos de ${residencia.nome}.`
            );
          }

          const lista: Dispositivo[] = await resposta.json();

          return lista.map((dispositivo) => ({
            ...dispositivo,
            residenciaId: residencia.id,
            residenciaNome: residencia.nome,
          }));
        })
      );

      setDispositivos(respostasDispositivos.flat());
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao carregar os dados."
      );
    } finally {
      setCarregando(false);
    }
  }, [headers, token]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  function abrirCadastro() {
    setEditando(null);
    setDeviceId("");
    setResidenciaId("");
    setErro("");
    setSucesso("");
    setModalAberto(true);
  }

  function abrirEdicao(dispositivo: Dispositivo) {
    setEditando(dispositivo);
    setDeviceId(dispositivo.deviceId);
    setResidenciaId(dispositivo.residenciaId);
    setErro("");
    setSucesso("");
    setModalAberto(true);
  }

  async function salvarDispositivo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setSucesso("");

    try {
      if (!deviceId.trim()) {
        throw new Error("Informe o identificador do dispositivo.");
      }

      if (!editando && !residenciaId) {
        throw new Error("Selecione uma residência.");
      }

      const url = editando
        ? `${API_URL}/dispositivos/${editando.id}`
        : `${API_URL}/dispositivos/residencia/${residenciaId}`;

      const resposta = await fetch(url, {
        method: editando ? "PUT" : "POST",
        headers: headers(),
        body: JSON.stringify({ deviceId: deviceId.trim() }),
      });

      if (!resposta.ok) {
        const mensagem = await resposta.text();
        throw new Error(
          mensagem || "Não foi possível salvar o dispositivo."
        );
      }

      setModalAberto(false);
      setSucesso(
        editando
          ? "Dispositivo atualizado com sucesso."
          : "Dispositivo cadastrado com sucesso."
      );

      await carregarDados();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao salvar o dispositivo."
      );
    }
  }

  async function alterarStatus(dispositivo: Dispositivo) {
    setErro("");
    setSucesso("");

    try {
      const resposta = await fetch(
        `${API_URL}/dispositivos/${dispositivo.id}/status`,
        {
          method: "PATCH",
          headers: headers(),
          body: JSON.stringify({ ativo: !dispositivo.ativo }),
        }
      );

      if (!resposta.ok) {
        const mensagem = await resposta.text();
        throw new Error(mensagem || "Não foi possível alterar o status.");
      }

      setSucesso(
        dispositivo.ativo
          ? "Dispositivo desativado com sucesso."
          : "Dispositivo ativado com sucesso."
      );

      await carregarDados();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao alterar o status."
      );
    }
  }

  async function excluirDispositivo() {
    if (!confirmacao) return;

    setErro("");
    setSucesso("");

    try {
      const resposta = await fetch(
        `${API_URL}/dispositivos/${confirmacao.id}`,
        {
          method: "DELETE",
          headers: headers(),
        }
      );

      if (!resposta.ok) {
        const mensagem = await resposta.text();
        throw new Error(mensagem || "Não foi possível excluir o dispositivo.");
      }

      setConfirmacao(null);
      setSucesso("Dispositivo excluído com sucesso.");
      await carregarDados();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao excluir o dispositivo."
      );
    }
  }

  const dispositivosFiltrados = dispositivos.filter((dispositivo) => {
    const residencia = residencias.find(
      (item) => item.id === dispositivo.residenciaId
    );

    const cliente = residencia?.usuario;

    const termo = filtro.toLowerCase();

    const correspondeTexto =
      dispositivo.deviceId.toLowerCase().includes(termo) ||
      dispositivo.residenciaNome.toLowerCase().includes(termo) ||
      (cliente?.nome.toLowerCase().includes(termo) ?? false);

    const correspondeStatus =
      filtroStatus === "TODOS" ||
      (filtroStatus === "ATIVO" && dispositivo.ativo) ||
      (filtroStatus === "INATIVO" && !dispositivo.ativo);

    return correspondeTexto && correspondeStatus;
  });

  const totalAtivos = dispositivos.filter((d) => d.ativo).length;
  const totalInativos = dispositivos.length - totalAtivos;

  return (
    <main className="min-h-screen bg-[#020b24] p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-sm font-medium text-blue-400">
              PAINEL TÉCNICO / GERENCIAMENTO
            </p>
            <h1 className="text-3xl font-bold sm:text-4xl">
              Dispositivos
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Gerencie os dispositivos IoT vinculados às residências.
            </p>
          </div>

          <button
            onClick={abrirCadastro}
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500"
          >
            + Novo dispositivo
          </button>
        </div>

        {erro && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
          >
            {erro}
            <button
              onClick={() => setErro("")}
              className="ml-3 font-bold"
              aria-label="Fechar mensagem de erro"
            >
              ×
            </button>
          </div>
        )}

        {sucesso && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300"
          >
            {sucesso}
          </div>
        )}

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Resumo
            titulo="Total de dispositivos"
            valor={dispositivos.length}
          />
          <Resumo titulo="Ativos" valor={totalAtivos} />
          <Resumo titulo="Inativos" valor={totalInativos} />
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/3 p-4 sm:p-6">
          <div className="mb-5 flex flex-col gap-3 md:flex-row">
            <input
              type="search"
              value={filtro}
              onChange={(event) => setFiltro(event.target.value)}
              placeholder="Buscar por dispositivo, residência ou cliente..."
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#07132e] px-4 py-3 text-sm outline-none transition placeholder:text-slate-500 focus:border-blue-500"
            />

            <select
              value={filtroStatus}
              onChange={(event) => setFiltroStatus(event.target.value)}
              className="rounded-xl border border-white/10 bg-[#07132e] px-4 py-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="TODOS">Todos os status</option>
              <option value="ATIVO">Ativos</option>
              <option value="INATIVO">Inativos</option>
            </select>

            <button
              onClick={carregarDados}
              className="rounded-xl border border-white/10 px-4 py-3 text-sm transition hover:bg-white/5"
            >
              Atualizar
            </button>
          </div>

          {carregando ? (
            <div className="py-16 text-center text-slate-400">
              Carregando dispositivos...
            </div>
          ) : dispositivosFiltrados.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mb-3 text-4xl">⌁</div>
              <h2 className="font-semibold">Nenhum dispositivo encontrado</h2>
              <p className="mt-2 text-sm text-slate-400">
                Cadastre um dispositivo ou altere os filtros da busca.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-190 text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="px-4 py-4 font-medium">Dispositivo</th>
                    <th className="px-4 py-4 font-medium">Residência</th>
                    <th className="px-4 py-4 font-medium">Cliente</th>
                    <th className="px-4 py-4 font-medium">Status</th>
                    <th className="px-4 py-4 text-right font-medium">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {dispositivosFiltrados.map((dispositivo) => {
                    const residencia = residencias.find(
                      (item) => item.id === dispositivo.residenciaId
                    );

                    return (
                      <tr
                        key={dispositivo.id}
                        className="border-b border-white/5 transition hover:bg-white/2.5"
                      >
                        <td className="px-4 py-4">
                          <p className="font-semibold">
                            {dispositivo.deviceId}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            ID: {dispositivo.id.slice(0, 8)}...
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <p>{dispositivo.residenciaNome}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {residencia?.endereco || "Endereço não informado"}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          {residencia?.usuario.nome || "—"}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              dispositivo.ativo
                                ? "bg-emerald-500/10 text-emerald-300"
                                : "bg-slate-500/10 text-slate-400"
                            }`}
                          >
                            {dispositivo.ativo ? "Ativo" : "Inativo"}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => abrirEdicao(dispositivo)}
                              className="rounded-lg border border-white/10 px-3 py-2 text-xs transition hover:bg-white/10 cursor-pointer"
                            >
                              Editar
                            </button>

                            <button
                              onClick={() => alterarStatus(dispositivo)}
                              className={`rounded-lg border px-3 py-2 text-xs transition ${
                                dispositivo.ativo
                                  ? "border-amber-500/20 text-amber-300 hover:bg-amber-500/10"
                                  : "border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/10"
                              }`}
                            >
                              {dispositivo.ativo ? "Desativar" : "Ativar"}
                            </button>

                            <button
                              onClick={() => setConfirmacao(dispositivo)}
                              className="rounded-lg border border-red-500/20 px-3 py-2 text-xs text-red-300 transition hover:bg-red-500/10 cursor-pointer"
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!carregando && dispositivos.length > 0 && (
            <p className="mt-4 text-xs text-slate-500">
              Exibindo {dispositivosFiltrados.length} de {dispositivos.length} dispositivos.
            </p>
          )}
        </section>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-dispositivo"
            className="my-auto w-full max-w-lg rounded-2xl border border-white/10 bg-[#07132e] p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="titulo-modal-dispositivo"
                  className="text-xl font-bold"
                >
                  {editando ? "Editar dispositivo" : "Novo dispositivo"}
                </h2>
                <p className="mt-1 text-sm text-slate-400 ">
                  {editando
                    ? "Atualize o identificador do dispositivo."
                    : "Cadastre um dispositivo e vincule-o a uma residência."}
                </p>
              </div>

              <button
                onClick={() => setModalAberto(false)}
                className="text-2xl text-slate-400 hover:text-white cursor-pointer"
                aria-label="Fechar modal"
              >
                ×
              </button>
            </div>

            <form onSubmit={salvarDispositivo} className="space-y-5">
              <div>
                <label
                  htmlFor="deviceId"
                  className="mb-2 block text-sm font-medium"
                >
                  Identificador do dispositivo
                </label>
                <input
                  id="deviceId"
                  value={deviceId}
                  onChange={(event) => setDeviceId(event.target.value)}
                  placeholder="Ex.: ESP32-RESIDENCIA-01"
                  required
                  maxLength={100}
                  className="w-full rounded-xl border border-white/10 bg-[#020b24] px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              {!editando && (
                <div>
                  <label
                    htmlFor="residenciaId"
                    className="mb-2 block text-sm font-medium"
                  >
                    Residência
                  </label>
                  <select
                    id="residenciaId"
                    value={residenciaId}
                    onChange={(event) => setResidenciaId(event.target.value)}
                    required
                    className="w-full rounded-xl border border-white/10 bg-[#020b24] px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="">Selecione uma residência</option>
                    {residencias.map((residencia) => (
                      <option key={residencia.id} value={residencia.id}>
                        {residencia.nome} — {residencia.usuario.nome}
                      </option>
                    ))}
                  </select>

                  {residencias.length === 0 && (
                    <p className="mt-2 text-xs text-amber-300">
                      Cadastre uma residência antes de registrar um dispositivo.
                    </p>
                  )}
                </div>
              )}

              {editando && (
                <div className="rounded-xl border border-white/10 bg-white/3 p-4 text-sm">
                  <p className="text-slate-400">Residência vinculada</p>
                  <p className="mt-1 font-medium">
                    {editando.residenciaNome}
                  </p>
                  <p className="mt-3 text-xs text-slate-500">
                    A chave de autenticação e o vínculo da residência não são alterados aqui.
                  </p>
                </div>
              )}

              {erro && (
                <p role="alert" className="text-sm text-red-300">
                  {erro}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm hover:bg-white/5 cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={!editando && residencias.length === 0}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  {editando ? "Salvar alterações" : "Cadastrar dispositivo"}
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
            <h2 id="titulo-confirmacao" className="text-xl font-bold">
              Excluir dispositivo?
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Você está prestes a excluir o dispositivo{" "}
              <strong className="text-white">{confirmacao.deviceId}</strong>.
              Essa ação não poderá ser desfeita.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setConfirmacao(null)}
                className="rounded-xl border border-white/10 px-4 py-3 text-sm hover:bg-white/5 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={excluirDispositivo}
                className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold hover:bg-red-500 cursor-pointer"
              >
                Confirmar exclusão
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function Resumo({ titulo, valor }: { titulo: string; valor: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/3 p-5">
      <p className="text-sm text-slate-400">{titulo}</p>
      <p className="mt-3 text-3xl font-bold">{valor}</p>
    </div>
  );
}
