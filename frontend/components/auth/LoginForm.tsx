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
      console.log("Dados do login:", values);

      /*
        FUTURAMENTE:

        const res = await authApi.login(values);

        localStorage.setItem("token", res.token);

        router.push("/dashboard");
      */

      router.push("/dashboard");
    } catch {
      setError("E-mail ou senha inválidos.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >

      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-sm font-medium text-slate-300"
        >
          E-mail
        </label>

        <input
          id="email"
          type="email"
          placeholder="seuemail@email.com"
          {...register("email")}
          className="
            w-full
            rounded-xl
            border
            border-blue-400/20
            bg-blue-950/20
            px-4
            py-3
            text-white
            outline-none
            transition-all
            duration-300

            placeholder:text-slate-500

            focus:border-blue-400/60
            focus:ring-2
            focus:ring-blue-500/20
          "
        />

        {errors.email && (
          <p className="text-sm text-red-400">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-slate-300"
        >
          Senha
        </label>

        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Digite sua senha"
            {...register("password")}
            className="
              w-full
              rounded-xl
              border
              border-blue-400/20
              bg-blue-950/20
              px-4
              py-3
              pr-12
              text-white
              outline-none
              transition-all
              duration-300

              placeholder:text-slate-500

              focus:border-blue-400/60
              focus:ring-2
              focus:ring-blue-500/20
            "
          />

          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((prev) => !prev)}
            className="
              absolute
              right-4
              top-1/2
              -translate-y-1/2
              cursor-pointer
              text-slate-400
              transition-colors
              duration-300
              hover:text-blue-400
            "
            aria-label={
              showPassword ? "Ocultar senha" : "Mostrar senha"
            }
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        {errors.password && (
          <p className="text-sm text-red-400">
            {errors.password.message}
          </p>
        )}
      </div>

      {error && (
        <div
          className="
            rounded-xl
            border
            border-red-500/30
            bg-red-500/10
            px-4
            py-3
            text-sm
            text-red-400
          "
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="
          h-12
          w-full
          cursor-pointer
          rounded-xl
          border
          border-blue-600
          bg-blue-600
          font-medium
          text-white
          shadow-[0_0_25px_rgba(37,99,235,0.25)]
          transition-all
          duration-500
          ease-in-out

          hover:border-blue-400
          hover:bg-transparent
          hover:text-blue-400

          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        {isSubmitting ? "Entrando..." : "Entrar"}
      </button>

      <button
        type="button"
        onClick={() => router.push("/")}
        className="
          w-full
          cursor-pointer
          text-sm
          text-slate-400
          transition-colors
          duration-300
          hover:text-blue-400
        "
      >
        ← Voltar ao início
      </button>
    </form>
  );
}