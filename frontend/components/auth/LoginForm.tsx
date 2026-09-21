"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff } from "lucide-react";

const formSchema = z.object({
  email: z
    .string()
    .min(1, "Informe seu e-mail.")
    .email("Informe um e-mail válido."),

  password: z
    .string()
    .min(1, "Informe sua senha.")
    .min(6, "A senha deve possuir pelo menos 6 caracteres."),
});

type LoginFormData = z.infer<typeof formSchema>;

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(formSchema),

    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormData) {
    setError(null);

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          senha: values.password,
        }),
      });

      if (!response.ok) {
        setError("E-mail ou senha inválidos.");
        return;
      }

      const data = await response.json();

      localStorage.setItem("token", data.token);
      localStorage.setItem("nome", data.nome);
      localStorage.setItem("email", data.email);
      localStorage.setItem("role", data.role);

      router.push("/dashboard");
    } catch (error) {
      console.error("Erro ao realizar login:", error);

      setError("Não foi possível conectar ao servidor.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-white"
        >
          E-mail
        </label>

        <input
          id="email"
          type="email"
          placeholder="seu@email.com"
          {...register("email")}
          className="w-full rounded-lg border border-blue-900 bg-[#071431] px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-blue-500"
        />

        {errors.email && (
          <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-medium text-white"
        >
          Senha
        </label>

        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Digite sua senha"
            {...register("password")}
            className="w-full rounded-lg border border-blue-900 bg-[#071431] px-4 py-3 pr-12 text-white outline-none transition placeholder:text-gray-500 focus:border-blue-500"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-white"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {errors.password && (
          <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
