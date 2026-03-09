import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@components/sh-dialog/dialog.component";

describe("Dialog", () => {
  it("conteúdo não está visível antes de abrir", () => {
    // Arrange & Act
    render(
      <Dialog>
        <DialogTrigger>Abrir</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Título</DialogTitle>
            <DialogDescription>Descrição</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );

    // Assert
    expect(screen.queryByText("Título")).not.toBeInTheDocument();
  });

  it("abre o dialog ao clicar no trigger", async () => {
    // Arrange
    render(
      <Dialog>
        <DialogTrigger>Abrir Dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Meu Dialog</DialogTitle>
          </DialogHeader>
          <p>Conteúdo do dialog</p>
        </DialogContent>
      </Dialog>,
    );

    // Act
    await userEvent.click(screen.getByText("Abrir Dialog"));

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Meu Dialog")).toBeInTheDocument();
    });
    expect(screen.getByText("Conteúdo do dialog")).toBeInTheDocument();
  });

  it("renderiza título e descrição quando aberto", async () => {
    // Arrange
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmação</DialogTitle>
            <DialogDescription>Tem certeza?</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Confirmação")).toBeInTheDocument();
      expect(screen.getByText("Tem certeza?")).toBeInTheDocument();
    });
  });
});
