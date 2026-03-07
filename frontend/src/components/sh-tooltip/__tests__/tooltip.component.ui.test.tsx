import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/sh-tooltip/tooltip.component";

describe("Tooltip", () => {
  it("conteúdo não está visível antes do hover", () => {
    // Arrange & Act
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Passe o mouse</TooltipTrigger>
          <TooltipContent>Dica de uso</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    // Assert
    expect(screen.queryByText("Dica de uso")).not.toBeInTheDocument();
  });

  it("exibe o conteúdo ao fazer hover no trigger", async () => {
    // Arrange
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover aqui</TooltipTrigger>
          <TooltipContent>Informação extra</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    // Act
    await userEvent.hover(screen.getByText("Hover aqui"));

    // Assert — Radix may render the tooltip content in multiple nodes (portal + hidden)
    await waitFor(() => {
      expect(screen.getAllByText("Informação extra")[0]).toBeInTheDocument();
    });
  });

  it("aplica data-slot correto no conteúdo após hover", async () => {
    // Arrange
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>T</TooltipTrigger>
          <TooltipContent data-testid="tip">Conteúdo</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    // Act
    await userEvent.hover(screen.getByText("T"));

    // Assert
    await waitFor(() => {
      const tips = screen.getAllByTestId("tip");
      expect(tips[0]).toHaveAttribute("data-slot", "tooltip-content");
    });
  });
});
