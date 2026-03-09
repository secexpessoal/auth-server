import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "@components/sh-button/button.component";

describe("Button", () => {
  it("renderiza com variant e size padrão", () => {
    // Arrange & Act
    render(<Button>Clique aqui</Button>);
    const btn = screen.getByRole("button", { name: /clique aqui/i });

    // Assert
    expect(btn).toHaveAttribute("data-variant", "default");
    expect(btn).toHaveAttribute("data-size", "default");
  });

  it("dispara click ao ser clicado", async () => {
    // Arrange
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Ação</Button>);

    // Act
    await userEvent.click(screen.getByRole("button"));

    // Assert
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("desabilitado não dispara click", async () => {
    // Arrange
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Desabilitado
      </Button>,
    );

    // Act
    await userEvent.click(screen.getByRole("button"));

    // Assert
    expect(onClick).not.toHaveBeenCalled();
  });

  it("aplica variant destructive corretamente", () => {
    // Arrange & Act
    render(<Button variant="destructive">Excluir</Button>);

    // Assert
    expect(screen.getByRole("button")).toHaveAttribute("data-variant", "destructive");
  });

  it("aplica size sm corretamente", () => {
    // Arrange & Act
    render(<Button size="sm">Pequeno</Button>);

    // Assert
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "sm");
  });
});
