import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Skeleton } from "@components/sh-skeleton/skeleton.component";

describe("Skeleton", () => {
  it("renderiza com data-slot correto", () => {
    // Arrange & Act
    render(<Skeleton data-testid="sk" />);

    // Assert
    expect(screen.getByTestId("sk")).toHaveAttribute("data-slot", "skeleton");
  });

  it("aplica className customizado", () => {
    // Arrange & Act
    render(<Skeleton data-testid="sk" className="w-32 h-4" />);

    // Assert
    expect(screen.getByTestId("sk")).toHaveClass("w-32", "h-4");
  });

  it("renderiza filhos quando fornecido", () => {
    // Arrange & Act
    render(<Skeleton>conteúdo</Skeleton>);

    // Assert
    expect(screen.getByText("conteúdo")).toBeInTheDocument();
  });
});
