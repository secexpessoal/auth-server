import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Popover, PopoverContent, PopoverTrigger } from "../popover.component";

describe("Popover", () => {
  describe("renderização", () => {
    it("deve renderizar o trigger corretamente", () => {
      render(
        <Popover>
          <PopoverTrigger>Abrir opções</PopoverTrigger>
          <PopoverContent>Conteúdo</PopoverContent>
        </Popover>,
      );
      expect(screen.getByText("Abrir opções")).toBeInTheDocument();
    });

    it("não deve exibir o conteúdo antes de abrir", () => {
      render(
        <Popover>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent>Conteúdo oculto</PopoverContent>
        </Popover>,
      );
      expect(screen.queryByText("Conteúdo oculto")).not.toBeInTheDocument();
    });
  });

  describe("estados", () => {
    it("deve exibir o conteúdo ao clicar no trigger", async () => {
      render(
        <Popover>
          <PopoverTrigger>Clique aqui</PopoverTrigger>
          <PopoverContent>Informação extra</PopoverContent>
        </Popover>,
      );
      await userEvent.click(screen.getByText("Clique aqui"));
      await waitFor(() => {
        expect(screen.getByText("Informação extra")).toBeInTheDocument();
      });
    });

    it("deve ter data-slot correto no conteúdo após abrir", async () => {
      render(
        <Popover>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent data-testid="pop-content">Conteúdo</PopoverContent>
        </Popover>,
      );
      await userEvent.click(screen.getByText("Trigger"));
      await waitFor(() => {
        expect(screen.getByTestId("pop-content")).toHaveAttribute("data-slot", "popover-content");
      });
    });
  });

  describe("interação", () => {
    it("deve fechar o popover ao pressionar Escape", async () => {
      render(
        <Popover>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent>Conteúdo</PopoverContent>
        </Popover>,
      );
      await userEvent.click(screen.getByText("Trigger"));
      await waitFor(() => expect(screen.getByText("Conteúdo")).toBeInTheDocument());
      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(screen.queryByText("Conteúdo")).not.toBeInTheDocument());
    });
  });

  describe("acessibilidade", () => {
    it("trigger deve ter data-slot=popover-trigger", () => {
      render(
        <Popover>
          <PopoverTrigger data-testid="trig">Abrir</PopoverTrigger>
          <PopoverContent>Conteúdo</PopoverContent>
        </Popover>,
      );
      expect(screen.getByTestId("trig")).toHaveAttribute("data-slot", "popover-trigger");
    });

    it("trigger deve ter aria-expanded refletindo o estado", async () => {
      render(
        <Popover>
          <PopoverTrigger>Abrir</PopoverTrigger>
          <PopoverContent>Conteúdo</PopoverContent>
        </Popover>,
      );
      expect(screen.getByText("Abrir")).toHaveAttribute("aria-expanded", "false");
      await userEvent.click(screen.getByText("Abrir"));
      await waitFor(() => expect(screen.getByText("Abrir")).toHaveAttribute("aria-expanded", "true"));
    });
  });
});
