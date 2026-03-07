import { Button } from "@components/sh-button/button.component";
import { X } from "lucide-react";
import React from "react";
import toast from "react-hot-toast";
import { cn } from "@lib/cn/cn.util";
import type { ToastProps } from "./toast.prop";
import { toastVariants } from "./toast.variant";

/**
 * Exibe uma notificação toast personalizada.
 *
 * - `content`: O conteúdo principal da mensagem toast (pode ser ReactNode).
 * - `duration`: Duração em milissegundos que o toast ficará visível (padrão: 4000ms).
 * - `icon`: Um componente de ícone React (SVG) opcional para ser exibido ao lado do conteúdo.
 * - `variant`: O tipo de feedback (info, warning, error, success).
 */
export const showToast = ({ content, duration = 4000, icon, variant = "success" }: ToastProps) => {
  toast(
    (component) => (
      <div className={cn("text-[#1a1a1a] bg-transparent rounded p-2 flex items-center gap-3", component.visible ? "animate-enter" : "animate-leave")}>
        {icon && React.createElement(icon, { className: cn(toastVariants({ variant })) })}

        <span className="flex-1 text-sm font-medium text-gray-800">{content}</span>

        <Button variant="default" type="button" onClick={() => toast.dismiss(component.id)}>
          <X className="w-4 h-4" />
        </Button>
      </div>
    ),
    { duration },
  );
};

