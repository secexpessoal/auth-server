import { X } from "lucide-react";
import React from "react";
import toast from "react-hot-toast";
import type { ToastProps } from "./toast.prop";
import { toastVariants } from "./toast.variant";
import { cn } from "@lib/utils/cn/cn.util";
import { Button } from "@lib/components/sh-button/button.component";

/**
 * Exibe uma notificação toast personalizada.
 *
 * - `content`: O conteúdo principal da mensagem toast (pode ser ReactNode).
 * - `duration`: Duração em milissegundos que o toast ficará visível (padrão: 4000ms).
 * - `icon`: Um componente de ícone React (SVG) opcional para ser exibido ao lado do conteúdo.
 * - `variant`: O tipo de feedback (info, warning, error, success).
 *
 * @param content - O conteúdo principal da mensagem toast (pode ser ReactNode).
 * @param duration - Duração em milissegundos que o toast ficará visível. Padrão: 4000.
 * @param icon - Componente de ícone React (SVG) exibido ao lado do conteúdo.
 * @param variant - Tipo de feedback visual: `info`, `warning`, `error` ou `success`. Padrão: `success`.
 *
 * @example
 * // Toast simples de sucesso
 * showToast({ content: "Salvo com sucesso." });
 *
 * @example
 * // Toast de erro com ícone e duração personalizada
 * import { AlertCircle } from "lucide-react";
 * showToast({ content: "Falha ao salvar.", variant: "error", icon: AlertCircle, duration: 6000 });
 */
export const showToast = ({ content, duration = 4000, icon, variant = "success" }: ToastProps) => {
  toast(
    (component) => (
      <div
        className={cn("text-foreground bg-transparent rounded p-2 flex items-center gap-3", component.visible ? "animate-enter" : "animate-leave")}
      >
        {icon && React.createElement(icon, { className: cn(toastVariants({ variant })) })}

        <span className="flex-1 text-sm font-medium text-foreground">{content}</span>

        <Button variant="default" type="button" onClick={() => toast.dismiss(component.id)}>
          <X className="w-4 h-4" />
        </Button>
      </div>
    ),
    { duration },
  );
};
