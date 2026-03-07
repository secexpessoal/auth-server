import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Checkbox } from "@components/sh-checkbox/checkbox.component";

describe("Checkbox", () => {
  it("renderiza desmarcado por padrão", () => {
    // Arrange & Act
    render(<Checkbox aria-label="aceitar" />);

    // Assert
    expect(screen.getByRole("checkbox", { name: "aceitar" })).not.toBeChecked();
  });

  it("marca ao clicar", async () => {
    // Arrange
    render(<Checkbox aria-label="aceitar" />);
    const checkbox = screen.getByRole("checkbox", { name: "aceitar" });

    // Act
    await userEvent.click(checkbox);

    // Assert
    expect(checkbox).toBeChecked();
  });

  it("pode ser desabilitado", () => {
    // Arrange & Act
    render(<Checkbox aria-label="desabilitado" disabled />);

    // Assert
    expect(screen.getByRole("checkbox", { name: "desabilitado" })).toBeDisabled();
  });

  it("aplica data-slot correto", () => {
    // Arrange & Act
    render(<Checkbox aria-label="slot" data-testid="cb" />);

    // Assert
    expect(screen.getByTestId("cb")).toHaveAttribute("data-slot", "checkbox");
  });
});
