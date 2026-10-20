"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import {
  Droplets,
  LockKeyhole,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RedefinirSenhaForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Link de recuperação inválido ou ausente.");
      return;
    }

    if (senha.length < 6) {
      setError("A senha deve possuir pelo menos 6 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/redefinir-senha",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token,
            novaSenha: senha,
          }),
        },
      );

      if (!response.ok) {
        if (response.status >= 500) {
          throw new Error("Erro no servidor. Tente novamente mais tarde.");
        }

        throw new Error(
          "O link de recuperação é inválido ou expirou. Solicite um novo link.",
        );
      }

      setSuccess(true);
      setSenha("");
      setConfirmarSenha("");

      window.history.replaceState(null, "", "/reset-password");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível conectar ao servidor.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020b24] px-4 py-10">
      <div className="pointer-events-none absolute left-1/2 -top-62.5 h-150 w-225 -translate-x-1/2 rounded-full bg-blue-400/10 blur-[150px]" />

      <div className="pointer-events-none absolute -bottom-62.5 -right-50 h-125 w-125 rounded-full bg-cyan-500/10 blur-[150px]" />

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/5 blur-[130px]" />

      <Card className="relative z-10 w-full max-w-md border border-blue-400/20 bg-[#07152f]/80 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <CardHeader className="text-center">
          {/* Ícone */}
          <div className="mb-4 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10 shadow-[0_0_25px_rgba(59,130,246,0.10)]">
              {success ? (
                <CheckCircle2 className="h-7 w-7 text-green-400" />
              ) : (
                <Droplets className="h-7 w-7 text-blue-400" />
              )}
            </div>
          </div>

          <CardTitle className="text-2xl font-medium uppercase text-white">
            {success ? "Senha atualizada" : "Redefinir senha"}
          </CardTitle>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            {success
              ? "Sua senha foi redefinida com sucesso."
              : "Digite e confirme sua nova senha para continuar."}
          </p>
        </CardHeader>

        <CardContent>
          {success ? (
            <div className="space-y-5">
              <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-4 text-center">
                <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-green-400" />

                <p className="text-sm leading-6 text-slate-300">
                  Sua senha foi alterada com sucesso. Agora você pode acessar a
                  plataforma utilizando sua nova senha.
                </p>
              </div>

              <Link
                href="/login"
                className="block w-full rounded-lg bg-blue-600 py-3 text-center font-semibold text-white transition hover:bg-blue-500"
              >
                Ir para o login
              </Link>
            </div>
          ) : !token ? (
            <div className="space-y-5">
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-4 text-center">
                <AlertCircle className="mx-auto mb-3 h-7 w-7 text-red-400" />

                <p className="text-sm text-red-400">
                  Link de recuperação inválido ou ausente.
                </p>
              </div>

              <Link
                href="/forgot-password"
                className="block rounded-lg bg-blue-600 py-3 text-center font-semibold text-white transition hover:bg-blue-500"
              >
                Solicitar novo link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="senha"
                  className="mb-2 block text-sm font-medium text-white"
                >
                  Nova senha
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    id="senha"
                    type={mostrarSenha ? "text" : "password"}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Digite sua nova senha"
                    className="w-full rounded-lg border border-blue-900 bg-[#071431] py-3 pl-11 pr-12 text-white outline-none transition placeholder:text-gray-500 focus:border-blue-500"
                  />

                  <button
                    type="button"
                    aria-label={
                      mostrarSenha ? "Ocultar senha" : "Mostrar senha"
                    }
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
                  >
                    {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  A senha deve possuir pelo menos 6 caracteres.
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmarSenha"
                  className="mb-2 block text-sm font-medium text-white"
                >
                  Confirmar nova senha
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    id="confirmarSenha"
                    type={mostrarConfirmacao ? "text" : "password"}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    placeholder="Confirme sua nova senha"
                    className="w-full rounded-lg border border-blue-900 bg-[#071431] py-3 pl-11 pr-12 text-white outline-none transition placeholder:text-gray-500 focus:border-blue-500"
                  />

                  <button
                    type="button"
                    aria-label={
                      mostrarConfirmacao ? "Ocultar senha" : "Mostrar senha"
                    }
                    onClick={() => setMostrarConfirmacao(!mostrarConfirmacao)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
                  >
                    {mostrarConfirmacao ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                >
                  {error}

                  <Link
                    href="/forgot-password"
                    className="mt-2 block font-medium text-blue-400 hover:underline"
                  >
                    Solicitar novo link
                  </Link>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Salvando..." : "Redefinir senha"}
              </button>

              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm text-slate-400 transition hover:text-white"
              >
                <ArrowLeft size={16} />
                Voltar ao login
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
