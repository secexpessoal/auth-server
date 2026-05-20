import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Label } from "../label.component";

describe("Label", () => {
  const user = userEvent.setup();

  describe("renderização", () => {
    it("deve renderizar com as props padrão", () => {
      render(<Label>Nome completo</Label>);
      expect(screen.getByText("Nome completo")).toBeInTheDocument();
    });

    it("deve ter data-slot=label", () => {
      render(<Label data-testid="lbl">Campo</Label>);
      expect(screen.getByTestId("lbl")).toHaveAttribute("data-slot", "label");
    });

    it("deve associar ao input via htmlFor", () => {
      render(
        <>
          <Label htmlFor="nome">Nome</Label>
          <input id="nome" />
        </>,
      );
      expect(screen.getByText("Nome")).toHaveAttribute("for", "nome");
    });
  });

  describe("estados", () => {
    it("deve aplicar classe customizada via className", () => {
      render(<Label className="text-destructive">Erro</Label>);
      expect(screen.getByText("Erro")).toHaveClass("text-destructive");
    });
  });

  describe("interação", () => {
    it("deve focar o input associado ao clicar no label", async () => {
      render(
        <>
          <Label htmlFor="campo-teste">Rótulo</Label>
          <input id="campo-teste" />
        </>,
      );
      await user.click(screen.getByText("Rótulo"));
      expect(screen.getByRole("textbox")).toHaveFocus();
    });
  });

  describe("acessibilidade", () => {
    it("deve ter tag label no DOM", () => {
      render(
        <>
          <Label htmlFor="inp">Usuário</Label>
          <input id="inp" />
        </>,
      );
      expect(screen.getByText("Usuário").tagName.toLowerCase()).toBe("label");
    });

    it("deve renderizar conteúdo como texto visível", () => {
      render(<Label>Senha</Label>);
      expect(screen.getByText("Senha")).toBeVisible();
    });
  });
});
