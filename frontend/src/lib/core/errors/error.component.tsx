import { Link } from "@tanstack/react-router";
import { MoveLeft, AlertCircle, Home, ShieldAlert, Ghost, RefreshCw } from "lucide-react";
import { Button } from "@lib/components/sh-button/button.component";
import { ThemeToggle } from "@lib/components/sh-theme-toggle/theme-toggle.component";

interface ErrorPageProps {
  code?: number;
  message?: string;
  details?: string;
  onRetry?: () => void;
}

export function ErrorPage({ code = 404, message = "Página não encontrada", details, onRetry }: ErrorPageProps) {
  const is404 = code === 404;
  const isSecurity = code === 403;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 selection:bg-primary/20 relative overflow-hidden">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Background Decor */}
      <div className="absolute top-[-15%] left-[-15%] w-[50%] h-[50%] bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
      <div className="absolute bottom-[-15%] right-[-15%] w-[50%] h-[50%] bg-blue-400/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse delay-700"></div>

      <div className="w-full max-w-lg relative z-10">
        <div className="bg-card rounded-[3rem] shadow-neumorph p-8 md:p-12 border border-white/20 transition-all duration-500 hover:shadow-neumorph-convex">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="mx-auto bg-card shadow-neumorph-convex w-20 h-20 rounded-3xl flex items-center justify-center border border-white/40">
              {is404 ? (
                <Ghost className="h-10 w-10 text-primary" />
              ) : isSecurity ? (
                <ShieldAlert className="h-10 w-10 text-destructive" />
              ) : (
                <AlertCircle className="h-10 w-10 text-warning" />
              )}
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 block">Error Protocol {code}</span>
              <h1 className="text-3xl font-black text-foreground tracking-tight">{message}</h1>
            </div>

            <p className="text-muted-foreground font-medium leading-relaxed">
              {is404
                ? "O recurso que você está tentando acessar não existe ou foi movido permanentemente no sistema."
                : "Houve uma interrupção no processamento. Se o problema persistir, notifique a equipe de segurança."}
            </p>

            {details && (
              <div className="w-full bg-black/5 dark:bg-white/5 rounded-lg p-4 border border-white/10 text-left">
                <p className="text-[10px] text-muted-foreground/40 mb-2 font-black uppercase tracking-widest">Stack Trace / Details</p>
                <code className="text-xs text-foreground/70 font-mono break-all block leading-tight">{details}</code>
              </div>
            )}

            <div className="w-full grid grid-cols-1 gap-4 pt-4">
              {onRetry ? (
                <Button onClick={onRetry} size="h12" className="w-full text-lg font-bold rounded-md">
                  <RefreshCw className="mr-2 h-5 w-5" />
                  Recarregar Sistema
                </Button>
              ) : (
                <Button asChild size="h12" className="w-full text-lg font-bold rounded-md">
                  <Link to="/" search={{ error_code: undefined }}>
                    <Home className="mr-2 h-5 w-5" />
                    Voltar ao Início
                  </Link>
                </Button>
              )}

              <Button variant="ghost" className="w-full font-bold text-muted-foreground hover:text-primary transition-all" onClick={() => window.history.back()}>
                <MoveLeft className="mr-2 h-4 w-4" />
                Retornar à Página Anterior
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
