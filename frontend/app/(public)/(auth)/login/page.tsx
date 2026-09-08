import Link from "next/link";
import { Droplets } from "lucide-react";

import LoginForm from "@/components/auth/LoginForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main
      className="
        relative
        flex
        min-h-screen
        items-center
        justify-center
        overflow-hidden
        bg-[#020b24]
        px-4
        py-10
      "
    >
      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          -top-62.5
          h-150
          w-225
          -translate-x-1/2
          rounded-full
          bg-blue-400/10
          blur-[150px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-62.5
          -right-50
          h-125
          w-125
          rounded-full
          bg-cyan-500/10
          blur-[150px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-125
          w-125
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-blue-600/5
          blur-[130px]
        "
      />

      <Card
        className="
          relative
          z-10
          w-full
          max-w-md
          border
          border-blue-400/20
          bg-[#07152f]/80
          shadow-[0_20px_80px_rgba(0,0,0,0.45)]
          backdrop-blur-xl
        "
      >
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div
              className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                border
                border-blue-400/20
                bg-blue-500/10
                shadow-[0_0_25px_rgba(59,130,246,0.10)]
              "
            >
              <Droplets className="h-7 w-7 text-blue-400" />
            </div>
          </div>

          <CardTitle
            className="
              text-2xl
              font-medium
              uppercase
              text-white
            "
          >
            Acessar plataforma
          </CardTitle>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Entre com seus dados para acessar o monitoramento.
          </p>
        </CardHeader>

        <CardContent>
          <LoginForm />

          <div className="mt-6 text-center text-sm text-slate-400">
            Esqueceu sua senha?
            <Link
              href="/forgot-password"
              className="
                ml-2
                font-medium
                text-blue-400
                transition-colors
                duration-300
                hover:text-blue-300
                hover:underline
              "
            >
              Recuperar
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
