import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "../checkbox.component";

describe("Checkbox", () => {
  describe("renderização", () => {
    it("deve renderizar desmarcado por padrão", () => {
      render(<Checkbox aria-label="aceitar termos" />);
      expect(screen.getByRole("checkbox", { name: "aceitar termos" })).not.toBeChecked();
    });

    it("deve renderizar marcado quando defaultChecked é verdadeiro", () => {
      render(<Checkbox aria-label="marcado" defaultChecked />);
      expect(screen.getByRole("checkbox", { name: "marcado" })).toBeChecked();
    });

    it("deve ter data-slot=checkbox", () => {
      render(<Checkbox aria-label="slot" />);
      expect(screen.getByRole("checkbox", { name: "slot" })).toHaveAttribute("data-slot", "checkbox");
    });
  });

  describe("estados", () => {
    it("deve estar desabilitado quando a prop disabled é verdadeira", () => {
      render(<Checkbox aria-label="desabilitado" disabled />);
      expect(screen.getByRole("checkbox", { name: "desabilitado" })).toBeDisabled();
    });

    it("não deve marcar quando desabilitado ao clicar", async () => {
      render(<Checkbox aria-label="desabilitado" disabled />);
      const checkbox = screen.getByRole("checkbox", { name: "desabilitado" });
      await userEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it("deve aplicar aria-invalid quando em estado de erro", () => {
      render(<Checkbox aria-label="com erro" aria-invalid="true" />);
      expect(screen.getByRole("checkbox", { name: "com erro" })).toHaveAttribute("aria-invalid", "true");
    });
  });

  describe("interação", () => {
    it("deve marcar ao clicar", async () => {
      render(<Checkbox aria-label="aceitar" />);
      const checkbox = screen.getByRole("checkbox", { name: "aceitar" });
      await userEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it("deve desmarcar ao clicar duas vezes", async () => {
      render(<Checkbox aria-label="alternar" />);
      const checkbox = screen.getByRole("checkbox", { name: "alternar" });
      await userEvent.click(checkbox);
      await userEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it("deve alternar ao pressionar Space", async () => {
      render(<Checkbox aria-label="teclado" />);
      const checkbox = screen.getByRole("checkbox", { name: "teclado" });
      checkbox.focus();
      await userEvent.keyboard(" ");
      expect(checkbox).toBeChecked();
    });

    it("deve chamar onCheckedChange ao alternar", async () => {
      const onCheckedChange = vi.fn();
      render(<Checkbox aria-label="callback" onCheckedChange={onCheckedChange} />);
      await userEvent.click(screen.getByRole("checkbox", { name: "callback" }));
      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });
  });

  describe("acessibilidade", () => {
    it("deve ter role checkbox", () => {
      render(<Checkbox aria-label="acessível" />);
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });

    it("deve respeitar aria-label quando fornecido", () => {
      render(<Checkbox aria-label="concordar com os termos" />);
      expect(screen.getByRole("checkbox", { name: "concordar com os termos" })).toBeInTheDocument();
    });
  });
});
