import { Link } from "@tanstack/react-router";
import { MoveLeft } from "lucide-react";
import { Button } from "../../components/sh-button/button.component";

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white p-6 overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full" />

      <div className="max-w-2xl w-full text-center z-10 space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="relative inline-block">
          <h1 className="text-[12rem] md:text-[16rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-white via-white/50 to-transparent opacity-20 select-none">
            404
          </h1>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl skew-y-1 transform transition-transform hover:skew-y-0 duration-500">
              <h2 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Caminho não encontrado
              </h2>
            </div>
          </div>
        </div>

        <div className="space-y-4 max-w-md mx-auto">
          <p className="text-gray-400 text-lg leading-relaxed">
            Parece que você se perdeu no espaço. A página que você está procurando não existe ou foi movida para outra dimensão.
          </p>
        </div>

        <div className="pt-8">
          <Button
            asChild
            className="px-8 py-6 bg-linear-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all duration-300 group"
          >
            <Link to="/">
              <MoveLeft className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform" />
              Voltar para o Painel
            </Link>
          </Button>
        </div>
      </div>

      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />
    </div>
  );
}
