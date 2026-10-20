import { Suspense } from "react";
import RedefinirSenhaForm from "@/components/auth/RedefinirSenhaForm";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#020b24] text-slate-400">
          Carregando...
        </main>
      }
    >
      <RedefinirSenhaForm />
    </Suspense>
  );
}
