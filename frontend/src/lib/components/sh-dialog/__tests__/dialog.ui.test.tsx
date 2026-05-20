import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../dialog.component";

describe("Dialog", () => {
  describe("renderização", () => {
    it("não deve exibir o conteúdo antes de abrir", () => {
      render(
        <Dialog>
          <DialogTrigger>Abrir</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Título do dialog</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>,
      );
      expect(screen.queryByText("Título do dialog")).not.toBeInTheDocument();
    });

    it("deve renderizar título e descrição quando aberto por padrão", async () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmação</DialogTitle>
              <DialogDescription>Tem certeza que deseja continuar?</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>,
      );
      await waitFor(() => {
        expect(screen.getByText("Confirmação")).toBeInTheDocument();
        expect(screen.getByText("Tem certeza que deseja continuar?")).toBeInTheDocument();
      });
    });
  });

  describe("estados", () => {
    it("deve exibir botão de fechar por padrão", async () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog com fechar</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>,
      );
      await waitFor(() => {
        expect(document.querySelector("[data-slot='dialog-close']")).toBeInTheDocument();
      });
    });
  });

  describe("interação", () => {
    it("deve abrir ao clicar no trigger", async () => {
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
      await userEvent.click(screen.getByText("Abrir Dialog"));
      await waitFor(() => {
        expect(screen.getByText("Meu Dialog")).toBeInTheDocument();
      });
    });

    it("deve fechar ao pressionar Escape", async () => {
      render(
        <Dialog>
          <DialogTrigger>Abrir</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Fechar com Escape</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>,
      );
      await userEvent.click(screen.getByText("Abrir"));
      await waitFor(() => expect(screen.getByText("Fechar com Escape")).toBeInTheDocument());
      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(screen.queryByText("Fechar com Escape")).not.toBeInTheDocument());
    });

    it("deve fechar ao clicar no botão de fechar", async () => {
      render(
        <Dialog>
          <DialogTrigger>Abrir</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Fechar botão</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>,
      );
      await userEvent.click(screen.getByText("Abrir"));
      await waitFor(() => expect(screen.getByText("Fechar botão")).toBeInTheDocument());
      const closeButton = document.querySelector<HTMLButtonElement>("[data-slot='dialog-close']");
      expect(closeButton).toBeTruthy();
      if (closeButton) {
        await userEvent.click(closeButton);
      }
      await waitFor(() => expect(screen.queryByText("Fechar botão")).not.toBeInTheDocument());
    });
  });

  describe("acessibilidade", () => {
    it("deve ter role=dialog quando aberto", async () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Acessível</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>,
      );
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });

    it("deve ter aria-labelledby apontando para o título", async () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Título acessível</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>,
      );
      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveAttribute("aria-labelledby");
      });
    });
  });
});
