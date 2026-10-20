"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Droplets, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/esqueci-senha",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao solicitar recuperação.");
      }

      setSuccess(true);
    } catch {
      setError("Não foi possível enviar a solicitação. Tente novamente.");
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
            {success ? "Verifique seu e-mail" : "Recuperar senha"}
          </CardTitle>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            {success
              ? "Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha."
              : "Informe seu e-mail cadastrado para receber um link de recuperação."}
          </p>
        </CardHeader>

        <CardContent>
          {success ? (
            <div className="space-y-5">
              <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-4 text-center">
                <Mail className="mx-auto mb-3 h-7 w-7 text-green-400" />

                <p className="text-sm leading-6 text-slate-300">
                  Verifique sua caixa de entrada e a pasta de spam. O link de
                  recuperação é válido por 15 minutos.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSuccess(false);
                  setError(null);
                }}
                className="w-full rounded-lg border border-blue-400/20 py-3 font-medium text-blue-400 transition hover:bg-blue-500/10"
              >
                Solicitar novamente
              </button>

              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm text-slate-400 transition hover:text-white"
              >
                <ArrowLeft size={16} />
                Voltar ao login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-white"
                >
                  E-mail
                </label>

                <div className="relative">
                  <Mail
                    size={19}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    autoComplete="email"
                    className="w-full rounded-lg border border-blue-900 bg-[#071431] py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-gray-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Enviando..." : "Enviar link de recuperação"}
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
