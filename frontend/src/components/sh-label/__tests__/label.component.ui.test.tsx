import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Label } from "@components/sh-label/label.component";

describe("Label", () => {
  it("renderiza o texto corretamente", () => {
    // Arrange & Act
    render(<Label>Nome</Label>);

    // Assert
    expect(screen.getByText("Nome")).toBeInTheDocument();
  });

  it("associa ao input via htmlFor", () => {
    // Arrange & Act
    render(
      <>
        <Label htmlFor="campo">E-mail</Label>
        <input id="campo" />
      </>,
    );

    // Assert
    const label = screen.getByText("E-mail");
    expect(label).toHaveAttribute("for", "campo");
  });

  it("aplica data-slot correto", () => {
    // Arrange & Act
    render(<Label data-testid="label">Senha</Label>);

    // Assert
    expect(screen.getByTestId("label")).toHaveAttribute("data-slot", "label");
  });
});
