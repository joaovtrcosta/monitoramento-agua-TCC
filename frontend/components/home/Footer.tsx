import { Droplets } from "lucide-react";

export default function Footer() {
  return (
    <footer className="px-6 py-8">
      <div
        className="
          mx-auto
          flex
          max-w-7xl
          flex-col
          items-center
          justify-between
          gap-3
          text-sm
          text-slate-400
          sm:flex-row
        "
      >
        <div className="flex items-center gap-2">
          <Droplets className="h-5 w-5 text-blue-400" />
          <span>Monitoramento inteligente de água</span>
        </div>

        <p>Projeto de TCC • 2026</p>
      </div>
    </footer>
  );
}
