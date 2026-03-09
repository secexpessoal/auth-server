import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Input } from "@components/sh-input/input.component";

describe("Input", () => {
  it("renderiza com data-slot correto", () => {
    // Arrange & Act
    render(<Input placeholder="campo" />);

    // Assert
    expect(screen.getByPlaceholderText("campo")).toHaveAttribute("data-slot", "input");
  });

  it("aceita digitação do usuário", async () => {
    // Arrange
    render(<Input placeholder="texto" />);

    // Act
    await userEvent.type(screen.getByPlaceholderText("texto"), "Olá");

    // Assert
    expect(screen.getByPlaceholderText("texto")).toHaveValue("Olá");
  });

  it("pode ser desabilitado", () => {
    // Arrange & Act
    render(<Input disabled placeholder="bloqueado" />);

    // Assert
    expect(screen.getByPlaceholderText("bloqueado")).toBeDisabled();
  });

  it("chama onChange ao digitar", async () => {
    // Arrange
    const onChange = vi.fn();
    render(<Input placeholder="cb" onChange={onChange} />);

    // Act
    await userEvent.type(screen.getByPlaceholderText("cb"), "a");

    // Assert
    expect(onChange).toHaveBeenCalled();
  });

  it("aplica type correto", () => {
    // Arrange & Act
    render(<Input type="email" placeholder="email" />);

    // Assert
    expect(screen.getByPlaceholderText("email")).toHaveAttribute("type", "email");
  });
});
