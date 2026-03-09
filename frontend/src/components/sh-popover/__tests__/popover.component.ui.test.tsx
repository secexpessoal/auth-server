import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Popover, PopoverContent, PopoverTrigger } from "@components/sh-popover/popover.component";

describe("Popover", () => {
  it("conteúdo não está visível antes de abrir", () => {
    // Arrange & Act
    render(
      <Popover>
        <PopoverTrigger>Abrir</PopoverTrigger>
        <PopoverContent>Conteúdo do popover</PopoverContent>
      </Popover>,
    );

    // Assert
    expect(screen.queryByText("Conteúdo do popover")).not.toBeInTheDocument();
  });

  it("abre o popover ao clicar no trigger", async () => {
    // Arrange
    render(
      <Popover>
        <PopoverTrigger>Clique aqui</PopoverTrigger>
        <PopoverContent>Informação extra</PopoverContent>
      </Popover>,
    );

    // Act
    await userEvent.click(screen.getByText("Clique aqui"));

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Informação extra")).toBeInTheDocument();
    });
  });

  it("renderiza conteúdo com data-slot correto após abrir", async () => {
    // Arrange
    render(
      <Popover>
        <PopoverTrigger>Trigger</PopoverTrigger>
        <PopoverContent data-testid="pop-content">Conteúdo</PopoverContent>
      </Popover>,
    );

    // Act
    await userEvent.click(screen.getByText("Trigger"));

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId("pop-content")).toHaveAttribute("data-slot", "popover-content");
    });
  });
});
