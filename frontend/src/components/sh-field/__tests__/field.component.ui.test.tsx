import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Field, FieldContent, FieldLabel } from "@components/sh-field/field.component";
import { Input } from "@components/sh-input/input.component";

describe("Field", () => {
  it("renderiza Field com label e conteúdo", () => {
    // Arrange & Act
    render(
      <Field>
        <FieldLabel htmlFor="campo">E-mail</FieldLabel>
        <FieldContent>
          <Input id="campo" placeholder="Digite o e-mail" />
        </FieldContent>
      </Field>,
    );

    // Assert
    expect(screen.getByText("E-mail")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Digite o e-mail")).toBeInTheDocument();
  });

  it("aplica data-slot correto no Field", () => {
    // Arrange & Act
    render(<Field data-testid="field" />);

    // Assert
    expect(screen.getByTestId("field")).toHaveAttribute("data-slot", "field");
  });

  it("aplica orientação horizontal quando especificado", () => {
    // Arrange & Act
    render(<Field orientation="horizontal" data-testid="field" />);

    // Assert
    expect(screen.getByTestId("field")).toHaveAttribute("data-orientation", "horizontal");
  });
});
