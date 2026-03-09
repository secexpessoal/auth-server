import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Separator } from "@components/sh-separator/separator.component";

describe("Separator", () => {
  it("renderiza com orientação horizontal por padrão", () => {
    // Arrange & Act
    render(<Separator data-testid="sep" />);

    // Assert
    expect(screen.getByTestId("sep")).toHaveAttribute("data-orientation", "horizontal");
  });

  it("renderiza com orientação vertical quando especificado", () => {
    // Arrange & Act
    render(<Separator orientation="vertical" data-testid="sep" />);

    // Assert
    expect(screen.getByTestId("sep")).toHaveAttribute("data-orientation", "vertical");
  });

  it("aplica className customizado", () => {
    // Arrange & Act
    render(<Separator className="minha-classe" data-testid="sep" />);

    // Assert
    expect(screen.getByTestId("sep")).toHaveClass("minha-classe");
  });
});
