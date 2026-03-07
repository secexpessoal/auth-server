import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Textarea } from "@components/sh-textarea/textarea.component";

describe("Textarea", () => {
  it("renderiza com data-slot correto", () => {
    // Arrange & Act
    render(<Textarea placeholder="mensagem" />);

    // Assert
    expect(screen.getByPlaceholderText("mensagem")).toHaveAttribute("data-slot", "textarea");
  });

  it("aceita digitação do usuário", async () => {
    // Arrange
    render(<Textarea placeholder="escreva aqui" />);
    const textarea = screen.getByPlaceholderText("escreva aqui");

    // Act
    await userEvent.type(textarea, "Olá mundo");

    // Assert
    expect(textarea).toHaveValue("Olá mundo");
  });

  it("pode ser desabilitado", () => {
    // Arrange & Act
    render(<Textarea disabled placeholder="desabilitado" />);

    // Assert
    expect(screen.getByPlaceholderText("desabilitado")).toBeDisabled();
  });

  it("chama onChange ao digitar", async () => {
    // Arrange
    const onChange = vi.fn();
    render(<Textarea placeholder="cb" onChange={onChange} />);

    // Act
    await userEvent.type(screen.getByPlaceholderText("cb"), "a");

    // Assert
    expect(onChange).toHaveBeenCalled();
  });
});
