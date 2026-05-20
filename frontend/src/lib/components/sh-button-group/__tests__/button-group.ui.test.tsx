import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ButtonGroup, ButtonGroupText, ButtonGroupSeparator } from "../button-group.component";
import { Button } from "@lib/components/sh-button/button.component";

describe("ButtonGroup", () => {
  const user = userEvent.setup();

  describe("renderização", () => {
    it("deve renderizar com as props padrão", () => {
      render(
        <ButtonGroup>
          <Button>Um</Button>
          <Button>Dois</Button>
        </ButtonGroup>,
      );

      expect(screen.getByRole("group")).toBeInTheDocument();
      expect(screen.getAllByRole("button")).toHaveLength(2);
    });

    it("deve aplicar a orientação vertical corretamente", () => {
      render(<ButtonGroup orientation="vertical" data-testid="grupo" />);

      expect(screen.getByTestId("grupo")).toHaveAttribute("data-orientation", "vertical");
    });
  });

  describe("estados", () => {
    it("deve aplicar className customizada", () => {
      render(<ButtonGroup className="custom-group" data-testid="grupo" />);
      expect(screen.getByTestId("grupo")).toHaveClass("custom-group");
    });
  });

  describe("interação", () => {
    it("deve chamar onClick ao ser clicado", async () => {
      const onClick = vi.fn();
      render(
        <ButtonGroup>
          <Button onClick={onClick}>Confirmar</Button>
        </ButtonGroup>,
      );

      await user.click(screen.getByRole("button", { name: "Confirmar" }));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("deve focar o primeiro botão ao navegar por teclado", async () => {
      render(
        <ButtonGroup>
          <Button>Primeiro</Button>
          <Button>Segundo</Button>
        </ButtonGroup>,
      );

      await user.tab();
      expect(screen.getByRole("button", { name: "Primeiro" })).toHaveFocus();
    });
  });

  describe("acessibilidade", () => {
    it("deve ter role=group", () => {
      render(<ButtonGroup />);
      expect(screen.getByRole("group")).toBeInTheDocument();
    });

    it("deve renderizar separador com data-slot", () => {
      render(
        <ButtonGroup>
          <ButtonGroupText>Prefixo</ButtonGroupText>
          <ButtonGroupSeparator />
          <Button>Ação</Button>
        </ButtonGroup>,
      );

      expect(document.querySelector("[data-slot='button-group-separator']")).toBeInTheDocument();
    });
  });
});
