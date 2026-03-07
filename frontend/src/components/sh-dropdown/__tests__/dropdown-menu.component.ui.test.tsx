import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/sh-dropdown/dropdown-menu.component";

describe("DropdownMenu", () => {
  it("itens não estão visíveis antes de abrir", () => {
    // Arrange & Act
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Abrir menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Perfil</DropdownMenuItem>
          <DropdownMenuItem>Sair</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    // Assert
    expect(screen.queryByText("Perfil")).not.toBeInTheDocument();
  });

  it("abre o menu ao clicar no trigger", async () => {
    // Arrange
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Configurações</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    // Act
    await userEvent.click(screen.getByText("Menu"));

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Configurações")).toBeInTheDocument();
    });
  });

  it("dispara callback ao clicar num item", async () => {
    // Arrange
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

    // Act
    await waitFor(() => screen.getByText("Ação"));
    await userEvent.click(screen.getByText("Ação"));

    // Assert
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("item desabilitado não dispara callback", async () => {
    // Arrange
    const onSelect = vi.fn();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={onSelect} disabled>
            Desabilitado
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await userEvent.click(screen.getByText("Menu"));

    // Act
    await waitFor(() => screen.getByText("Desabilitado"));
    await userEvent.click(screen.getByText("Desabilitado"));

    // Assert
    expect(onSelect).not.toHaveBeenCalled();
  });
});
