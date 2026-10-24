"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Perfil = {
  nome: string;
  email: string;
  role?: string;
};

const API_URL = "http://localhost:8080/api/perfil";

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<Perfil>({
    nome: "",
    email: "",
  });

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarPerfil() {
      const token = localStorage.getItem("token");

      if (!token) {
        setErro("Sua sessão não foi encontrada. Faça login novamente.");
        setCarregando(false);
        return;
      }

      try {
        const resposta = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (resposta.status === 401 || resposta.status === 403) {
          setErro("Sua sessão expirou. Faça login novamente.");
          return;
        }

        if (!resposta.ok) {
          throw new Error("Não foi possível carregar seu perfil.");
        }

        const dados: Perfil = await resposta.json();
        setPerfil({
          nome: dados.nome ?? "",
          email: dados.email ?? "",
          role: dados.role,
        });
      } catch (error) {
        setErro(
          error instanceof Error ? error.message : "Erro ao carregar o perfil.",
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarPerfil();
  }, []);

  async function salvarPerfil(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensagem("");
    setErro("");

    const token = localStorage.getItem("token");

    if (!token) {
      setErro("Faça login novamente para continuar.");
      return;
    }

    setSalvandoPerfil(true);

    try {
      const resposta = await fetch(API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome: perfil.nome.trim(),
          email: perfil.email.trim(),
        }),
      });

      const dados = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        const mensagemErro =
          dados.message ||
          dados.mensagem ||
          dados.detail ||
          (resposta.status === 409
            ? "Este e-mail já está cadastrado. Utilize outro e-mail."
            : resposta.status === 400
              ? "Verifique os dados informados e tente novamente."
              : resposta.status === 401
                ? "Sua sessão expirou. Faça login novamente."
                : resposta.status === 403
                  ? "Você não tem permissão para realizar esta alteração."
                  : "Não foi possível atualizar seu perfil. Tente novamente.");

        throw new Error(mensagemErro);
      }

      const nomeAtualizado = dados.nome ?? perfil.nome.trim();
      const emailAtualizado = dados.email ?? perfil.email.trim();

      setPerfil({
        nome: nomeAtualizado,
        email: emailAtualizado,
        role: dados.role ?? perfil.role,
      });

      localStorage.setItem("nome", nomeAtualizado);
      localStorage.setItem("email", emailAtualizado);

      window.dispatchEvent(
        new CustomEvent("perfilAtualizado", {
          detail: { nome: nomeAtualizado },
        }),
      );

      setMensagem("Perfil atualizado com sucesso!");
    } catch (error) {
      setErro(
        error instanceof Error ? error.message : "Erro ao atualizar o perfil.",
      );
    } finally {
      setSalvandoPerfil(false);
    }
  }

  async function alterarSenha(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensagem("");
    setErro("");

    if (novaSenha.length < 8) {
      setErro("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setErro("Faça login novamente para continuar.");
      return;
    }

    setSalvandoSenha(true);

    try {
      const resposta = await fetch(`${API_URL}/senha`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          senhaAtual,
          novaSenha,
        }),
      });

      const dados = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        throw new Error(
          dados.message ||
            dados.mensagem ||
            "Não foi possível alterar a senha.",
        );
      }

      setSenhaAtual("");
      setNovaSenha("");
      setMensagem("Senha alterada com sucesso!");
    } catch (error) {
      setErro(
        error instanceof Error ? error.message : "Erro ao alterar a senha.",
      );
    } finally {
      setSalvandoSenha(false);
    }
  }

  const campoClasse =
    "mt-2 w-full rounded-xl border border-blue-400/20 bg-[#061333] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400";

  return (
    <div className="text-white">
      <div className="mx-auto max-w-4xl">
        <h1 className="mt-6 text-3xl font-bold">Meu perfil</h1>

        <p className="mt-2 text-slate-400">
          Gerencie seus dados pessoais e as configurações da sua conta.
        </p>

        {mensagem && (
          <div
            role="status"
            className="mt-6 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-300"
          >
            {mensagem}
          </div>
        )}

        {erro && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300"
          >
            {erro}
          </div>
        )}

        {carregando ? (
          <p className="mt-8 text-slate-400">Carregando perfil...</p>
        ) : (
          <div className="mt-8 grid gap-6">
            <section className="rounded-2xl border border-blue-400/10 bg-blue-950/20 p-5 sm:p-7">
              <h2 className="text-xl font-semibold">Dados pessoais</h2>

              <p className="mt-1 text-sm text-slate-400">
                Atualize seu nome e e-mail de acesso.
              </p>

              <form onSubmit={salvarPerfil} className="mt-6 space-y-5">
                <div>
                  <label htmlFor="nome" className="text-sm text-slate-300">
                    Nome completo
                  </label>
                  <input
                    id="nome"
                    type="text"
                    autoComplete="name"
                    required
                    maxLength={150}
                    value={perfil.nome}
                    onChange={(event) =>
                      setPerfil({ ...perfil, nome: event.target.value })
                    }
                    className={campoClasse}
                    placeholder="Digite seu nome"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="text-sm text-slate-300">
                    E-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={perfil.email}
                    onChange={(event) =>
                      setPerfil({ ...perfil, email: event.target.value })
                    }
                    className={campoClasse}
                    placeholder="seu@email.com"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={salvandoPerfil}
                    className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                  >
                    {salvandoPerfil ? "Salvando..." : "Salvar alterações"}
                  </button>
                </div>
              </form>
            </section>

            <section className="rounded-2xl border border-blue-400/10 bg-blue-950/20 p-5 sm:p-7">
              <h2 className="text-xl font-semibold">Segurança</h2>

              <p className="mt-1 text-sm text-slate-400">
                Altere sua senha de acesso. Será necessário confirmar a senha
                atual.
              </p>

              <form onSubmit={alterarSenha} className="mt-6 space-y-5">
                <div>
                  <label
                    htmlFor="senhaAtual"
                    className="text-sm text-slate-300"
                  >
                    Senha atual
                  </label>

                  <div className="relative mt-2">
                    <input
                      id="senhaAtual"
                      type={mostrarSenhaAtual ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={senhaAtual}
                      onChange={(event) => setSenhaAtual(event.target.value)}
                      className="w-full rounded-xl border border-blue-400/20 bg-[#061333] px-4 py-3 pr-16 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400"
                      placeholder="Digite sua senha atual"
                    />

                    <button
                      type="button"
                      onClick={() => setMostrarSenhaAtual(!mostrarSenhaAtual)}
                      className="absolute inset-y-0 right-3 flex items-center text-slate-400 transition hover:text-blue-400 cursor-pointer"
                      aria-label={
                        mostrarSenhaAtual
                          ? "Ocultar senha atual"
                          : "Mostrar senha atual"
                      }
                    >
                      {mostrarSenhaAtual ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="novaSenha" className="text-sm text-slate-300">
                    Nova senha
                  </label>

                  <div className="relative mt-2">
                    <input
                      id="novaSenha"
                      type={mostrarNovaSenha ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={novaSenha}
                      onChange={(event) => setNovaSenha(event.target.value)}
                      className="w-full rounded-xl border border-blue-400/20 bg-[#061333] px-4 py-3 pr-16 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400"
                      placeholder="Mínimo de 8 caracteres"
                    />

                    <button
                      type="button"
                      onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)}
                      className="absolute inset-y-0 right-3 flex items-center text-slate-400 transition hover:text-blue-400 cursor-pointer"
                      aria-label={
                        mostrarNovaSenha
                          ? "Ocultar nova senha"
                          : "Mostrar nova senha"
                      }
                    >
                      {mostrarNovaSenha ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={salvandoSenha}
                    className="rounded-xl border border-blue-400/30 px-5 py-3 text-sm font-semibold text-blue-300 transition hover:bg-blue-400/10 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                  >
                    {salvandoSenha ? "Alterando..." : "Alterar senha"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </div>
      <footer className="mt-8 flex flex-col items-center justify-center gap-2 border-t border-blue-400/10 py-6 text-center text-xs text-slate-500">
        <p>Monitoramento inteligente de água</p>
        <p>Projeto de TCC · 2026</p>
      </footer>
    </div>
  );
}
