import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../dropdown-menu.component";

describe("DropdownMenu", () => {
  describe("renderização", () => {
    it("não deve exibir itens antes de abrir", () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Abrir menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Perfil</DropdownMenuItem>
            <DropdownMenuItem>Sair</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(screen.queryByText("Perfil")).not.toBeInTheDocument();
    });

    it("deve renderizar o trigger corretamente", () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu de ações</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(screen.getByText("Menu de ações")).toBeInTheDocument();
    });
  });

  describe("estados", () => {
    it("deve exibir itens ao abrir", async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Configurações</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      await userEvent.click(screen.getByText("Menu"));
      await waitFor(() => expect(screen.getByText("Configurações")).toBeInTheDocument());
    });

    it("item desabilitado não deve disparar callback", async () => {
      const onSelect = vi.fn();
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={onSelect} disabled>
              Bloqueado
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      await userEvent.click(screen.getByText("Menu"));
      await waitFor(() => screen.getByText("Bloqueado"));
      await userEvent.click(screen.getByText("Bloqueado"));
      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  describe("interação", () => {
    it("deve abrir ao clicar no trigger", async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Configurações</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      await userEvent.click(screen.getByText("Menu"));
      await waitFor(() => expect(screen.getByText("Configurações")).toBeInTheDocument());
    });

    it("deve chamar onSelect ao clicar em item", async () => {
      const onSelect = vi.fn();
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={onSelect}>Ação</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      await userEvent.click(screen.getByText("Menu"));
      await waitFor(() => screen.getByText("Ação"));
      await userEvent.click(screen.getByText("Ação"));
      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it("deve fechar ao pressionar Escape", async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      await userEvent.click(screen.getByText("Menu"));
      await waitFor(() => screen.getByText("Item"));
      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(screen.queryByText("Item")).not.toBeInTheDocument());
    });
  });

  describe("acessibilidade", () => {
    it("trigger deve ter aria-expanded=false quando fechado", () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(screen.getByText("Menu")).toHaveAttribute("aria-expanded", "false");
    });

    it("itens devem ter role=menuitem", async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Ação acessível</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      await userEvent.click(screen.getByText("Menu"));
      await waitFor(() => expect(screen.getByRole("menuitem", { name: "Ação acessível" })).toBeInTheDocument());
    });
  });
});
