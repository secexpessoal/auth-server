import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { RadioGroup, RadioGroupItem } from "@components/sh-radio-check/radio-check.component";

describe("RadioGroup", () => {
  it("renderiza o grupo com itens corretamente", () => {
    // Arrange
    render(
      <RadioGroup>
        <RadioGroupItem value="opcao1" aria-label="Opção 1" />
        <RadioGroupItem value="opcao2" aria-label="Opção 2" />
      </RadioGroup>,
    );

    // Assert
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(2);
  });

  it("seleciona um item ao clicar", async () => {
    // Arrange
    render(
      <RadioGroup>
        <RadioGroupItem value="a" aria-label="A" />
        <RadioGroupItem value="b" aria-label="B" />
      </RadioGroup>,
    );
    const radioA = screen.getByRole("radio", { name: "A" });

    // Act
    await userEvent.click(radioA);

    // Assert
    expect(radioA).toBeChecked();
  });

  it("item desabilitado não pode ser selecionado", async () => {
    // Arrange
    render(
      <RadioGroup>
        <RadioGroupItem value="a" aria-label="A" disabled />
      </RadioGroup>,
    );
    const radio = screen.getByRole("radio", { name: "A" });

    // Assert
    expect(radio).toBeDisabled();
  });

  it("aplica variante horizontal com classe correta", () => {
    // Arrange
    render(
      <RadioGroup variant="horizontal" data-testid="grupo">
        <RadioGroupItem value="a" aria-label="A" />
      </RadioGroup>,
    );

    // Assert — a variante horizontal usa flex-row
    const group = screen.getByTestId("grupo");
    expect(group).toHaveClass("flex");
    expect(group).toHaveClass("flex-row");
  });

  it("aplica variante vertical (padrão) com classe correta", () => {
    // Arrange
    render(
      <RadioGroup data-testid="grupo">
        <RadioGroupItem value="a" aria-label="A" />
      </RadioGroup>,
    );

    // Assert — a variante vertical usa grid
    const group = screen.getByTestId("grupo");
    expect(group).toHaveClass("grid");
  });

  it("mantém valor controlado quando recebe value prop", () => {
    // Arrange
    render(
      <RadioGroup value="b">
        <RadioGroupItem value="a" aria-label="A" />
        <RadioGroupItem value="b" aria-label="B" />
      </RadioGroup>,
    );

    // Assert
    expect(screen.getByRole("radio", { name: "B" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "A" })).not.toBeChecked();
  });
});
