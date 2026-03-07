import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@components/sh-drawer/drawer.component";

describe("Sheet (Drawer)", () => {
  it("conteúdo não está visível antes de abrir", () => {
    // Arrange & Act
    render(
      <Sheet>
        <SheetTrigger>Abrir</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Título do Drawer</SheetTitle>
          </SheetHeader>
          <p>Conteúdo interno</p>
        </SheetContent>
      </Sheet>,
    );

    // Assert
    expect(screen.queryByText("Conteúdo interno")).not.toBeInTheDocument();
  });

  it("abre o drawer ao clicar no trigger", async () => {
    // Arrange
    render(
      <Sheet>
        <SheetTrigger>Abrir</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Drawer Aberto</SheetTitle>
          </SheetHeader>
          <p>Conteúdo do drawer</p>
        </SheetContent>
      </Sheet>,
    );

    // Act
    await userEvent.click(screen.getByText("Abrir"));

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Conteúdo do drawer")).toBeInTheDocument();
    });
  });

  it("renderiza título e descrição no header", async () => {
    // Arrange
    render(
      <Sheet defaultOpen>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Meu Drawer</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Meu Drawer")).toBeInTheDocument();
    });
  });
});
