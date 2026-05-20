import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../alert-dialog.component";

function AlertDialogDemo({ onConfirm = vi.fn(), onCancel = vi.fn() }: { onConfirm?: () => void; onCancel?: () => void } = {}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger>Excluir</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
          <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Confirmar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

describe("AlertDialog", () => {
  describe("renderização", () => {
    it("não deve exibir o conteúdo antes de abrir", () => {
      render(<AlertDialogDemo />);
      expect(screen.queryByText("Confirmar exclusão")).not.toBeInTheDocument();
    });

    it("deve renderizar título e descrição ao abrir", async () => {
      render(<AlertDialogDemo />);
      await userEvent.click(screen.getByText("Excluir"));
      await waitFor(() => {
        expect(screen.getByText("Confirmar exclusão")).toBeInTheDocument();
        expect(screen.getByText("Esta ação não pode ser desfeita.")).toBeInTheDocument();
      });
    });
  });

  describe("estados", () => {
    it("deve exibir botões de Cancelar e Confirmar", async () => {
      render(<AlertDialogDemo />);
      await userEvent.click(screen.getByText("Excluir"));
      await waitFor(() => {
        expect(screen.getByText("Cancelar")).toBeInTheDocument();
        expect(screen.getByText("Confirmar")).toBeInTheDocument();
      });
    });
  });

  describe("interação", () => {
    it("deve chamar onConfirm ao clicar em Confirmar", async () => {
      const onConfirm = vi.fn();
      render(<AlertDialogDemo onConfirm={onConfirm} />);
      await userEvent.click(screen.getByText("Excluir"));
      await waitFor(() => screen.getByText("Confirmar"));
      await userEvent.click(screen.getByText("Confirmar"));
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it("deve chamar onCancel ao clicar em Cancelar", async () => {
      const onCancel = vi.fn();
      render(<AlertDialogDemo onCancel={onCancel} />);
      await userEvent.click(screen.getByText("Excluir"));
      await waitFor(() => screen.getByText("Cancelar"));
      await userEvent.click(screen.getByText("Cancelar"));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("deve fechar ao pressionar Escape", async () => {
      render(<AlertDialogDemo />);
      await userEvent.click(screen.getByText("Excluir"));
      await waitFor(() => expect(screen.getByText("Confirmar exclusão")).toBeInTheDocument());
      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(screen.queryByText("Confirmar exclusão")).not.toBeInTheDocument());
    });
  });

  describe("acessibilidade", () => {
    it("deve ter role=alertdialog quando aberto", async () => {
      render(<AlertDialogDemo />);
      await userEvent.click(screen.getByText("Excluir"));
      await waitFor(() => {
        expect(screen.getByRole("alertdialog")).toBeInTheDocument();
      });
    });

    it("deve ter aria-labelledby no alertdialog", async () => {
      render(<AlertDialogDemo />);
      await userEvent.click(screen.getByText("Excluir"));
      await waitFor(() => {
        expect(screen.getByRole("alertdialog")).toHaveAttribute("aria-labelledby");
      });
    });
  });
});
