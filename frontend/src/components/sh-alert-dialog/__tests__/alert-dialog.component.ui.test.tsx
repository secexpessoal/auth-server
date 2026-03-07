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
} from "@components/sh-alert-dialog/alert-dialog.component";

function AlertDialogDemo({ onConfirm = vi.fn(), onCancel = vi.fn() } = {}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger>Excluir</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
          <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline" size="default" onClick={onCancel}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction variant="default" size="default" onClick={onConfirm}>
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

describe("AlertDialog", () => {
  it("conteúdo não está visível antes de abrir", () => {
    // Arrange & Act
    render(<AlertDialogDemo />);

    // Assert
    expect(screen.queryByText("Confirmar exclusão")).not.toBeInTheDocument();
  });

  it("abre ao clicar no trigger", async () => {
    // Arrange
    render(<AlertDialogDemo />);

    // Act
    await userEvent.click(screen.getByText("Excluir"));

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Confirmar exclusão")).toBeInTheDocument();
    });
    expect(screen.getByText("Esta ação não pode ser desfeita.")).toBeInTheDocument();
  });

  it("botão de ação chama o callback ao confirmar", async () => {
    // Arrange
    const onConfirm = vi.fn();
    render(<AlertDialogDemo onConfirm={onConfirm} />);
    await userEvent.click(screen.getByText("Excluir"));

    // Act
    await waitFor(() => screen.getByText("Confirmar"));
    await userEvent.click(screen.getByText("Confirmar"));

    // Assert
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
