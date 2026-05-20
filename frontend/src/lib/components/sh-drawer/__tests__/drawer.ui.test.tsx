import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../drawer.component";

describe("Sheet (Drawer)", () => {
  describe("renderização", () => {
    it("não deve exibir o conteúdo antes de abrir", () => {
      render(
        <Sheet>
          <SheetTrigger>Abrir</SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Título oculto</SheetTitle>
            </SheetHeader>
          </SheetContent>
        </Sheet>,
      );
      expect(screen.queryByText("Título oculto")).not.toBeInTheDocument();
    });

    it("deve renderizar título e descrição quando aberto por padrão", async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Painel lateral</SheetTitle>
              <SheetDescription>Informações do processo selecionado</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>,
      );
      await waitFor(() => {
        expect(screen.getByText("Painel lateral")).toBeInTheDocument();
        expect(screen.getByText("Informações do processo selecionado")).toBeInTheDocument();
      });
    });
  });

  describe("estados", () => {
    it("deve exibir botão de fechar quando aberto", async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Drawer aberto</SheetTitle>
            </SheetHeader>
          </SheetContent>
        </Sheet>,
      );
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
      });
    });
  });

  describe("interação", () => {
    it("deve abrir ao clicar no trigger", async () => {
      render(
        <Sheet>
          <SheetTrigger>Abrir drawer</SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Conteúdo do drawer</SheetTitle>
            </SheetHeader>
          </SheetContent>
        </Sheet>,
      );
      await userEvent.click(screen.getByText("Abrir drawer"));
      await waitFor(() => {
        expect(screen.getByText("Conteúdo do drawer")).toBeInTheDocument();
      });
    });

    it("deve fechar ao pressionar Escape", async () => {
      render(
        <Sheet>
          <SheetTrigger>Abrir</SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Fechar com Escape</SheetTitle>
            </SheetHeader>
          </SheetContent>
        </Sheet>,
      );
      await userEvent.click(screen.getByText("Abrir"));
      await waitFor(() => expect(screen.getByText("Fechar com Escape")).toBeInTheDocument());
      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(screen.queryByText("Fechar com Escape")).not.toBeInTheDocument());
    });
  });

  describe("acessibilidade", () => {
    it("deve ter role=dialog quando aberto", async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Acessível</SheetTitle>
            </SheetHeader>
          </SheetContent>
        </Sheet>,
      );
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });

    it("trigger deve ter data-slot=sheet-trigger", () => {
      render(
        <Sheet>
          <SheetTrigger data-testid="trig">Abrir</SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Sheet</SheetTitle>
            </SheetHeader>
          </SheetContent>
        </Sheet>,
      );
      expect(screen.getByTestId("trig")).toHaveAttribute("data-slot", "sheet-trigger");
    });
  });
});
