import { Link } from "@tanstack/react-router";
import { MoveLeft, AlertCircle, Home, ShieldAlert, Ghost } from "lucide-react";
import { Button } from "@components/sh-button/button.component";

interface ErrorPageProps {
  code?: number;
  message?: string;
  details?: string;
}

export function ErrorPage({ code = 404, message = "Página não encontrada", details }: ErrorPageProps) {
  const is404 = code === 404;
  const isSecurity = code === 403;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900 p-6 font-sans">
      <div className="max-w-md w-full bg-white border border-slate-200 shadow-sm rounded-xl p-8 space-y-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-3 bg-slate-100 rounded-full">
            {is404 ? (
              <Ghost className="h-8 w-8 text-slate-400" />
            ) : isSecurity ? (
              <ShieldAlert className="h-8 w-8 text-red-500" />
            ) : (
              <AlertCircle className="h-8 w-8 text-amber-500" />
            )}
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Erro {code}</span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{message}</h1>
          </div>

          <p className="text-sm text-slate-500 leading-relaxed">
            {is404
              ? "O recurso que você está tentando acessar não existe ou foi movido permanentemente."
              : "Não foi possível processar sua solicitação no momento. Se o problema persistir, contate o administrador do sistema."}
          </p>
        </div>

        {details && (
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 italic">
            <p className="text-xs text-slate-400 mb-1 font-mono uppercase">Detalhes Técnicos</p>
            <p className="text-xs text-slate-600 font-mono break-all">{details}</p>
          </div>
        )}

        <div className="flex flex-col gap-3 pt-2">
          <Button asChild variant="default" className="w-full">
            <Link to="/" search={{ error_code: undefined }}>
              <Home className="mr-2 h-4 w-4" />
              Voltar ao Início
            </Link>
          </Button>

          <Button variant="outline" className="w-full" onClick={() => window.history.back()}>
            <MoveLeft className="mr-2 h-4 w-4" />
            Página Anterior
          </Button>
        </div>
      </div>

      <p className="mt-8 text-xs text-slate-400">Sistema de Autenticação e Perfil</p>
    </div>
  );
}
