import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Textarea } from "../textarea.component";

describe("Textarea", () => {
  describe("renderização", () => {
    it("deve renderizar com as props padrão", () => {
      render(<Textarea placeholder="Escreva aqui" />);
      const textarea = screen.getByPlaceholderText("Escreva aqui");
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveAttribute("data-slot", "textarea");
    });

    it("deve exibir valor padrão quando defaultValue é fornecido", () => {
      render(<Textarea defaultValue="texto inicial" placeholder="campo" />);
      expect(screen.getByPlaceholderText("campo")).toHaveValue("texto inicial");
    });
  });

  describe("estados", () => {
    it("deve estar desabilitado quando a prop disabled é verdadeira", () => {
      render(<Textarea disabled placeholder="bloqueado" />);
      expect(screen.getByPlaceholderText("bloqueado")).toBeDisabled();
    });

    it("deve aplicar aria-invalid quando em estado de erro", () => {
      render(<Textarea aria-invalid="true" placeholder="inválido" />);
      expect(screen.getByPlaceholderText("inválido")).toHaveAttribute("aria-invalid", "true");
    });
  });

  describe("interação", () => {
    it("deve aceitar digitação do usuário", async () => {
      render(<Textarea placeholder="campo" />);
      const textarea = screen.getByPlaceholderText("campo");
      await userEvent.type(textarea, "Texto longo\nCom quebra de linha");
      expect(textarea).toHaveValue("Texto longo\nCom quebra de linha");
    });

    it("deve chamar onChange ao digitar", async () => {
      const onChange = vi.fn();
      render(<Textarea placeholder="campo" onChange={onChange} />);
      await userEvent.type(screen.getByPlaceholderText("campo"), "a");
      expect(onChange).toHaveBeenCalled();
    });

    it("deve receber foco ao ser clicado", async () => {
      render(<Textarea placeholder="campo" />);
      const textarea = screen.getByPlaceholderText("campo");
      await userEvent.click(textarea);
      expect(textarea).toHaveFocus();
    });
  });

  describe("acessibilidade", () => {
    it("deve ter data-slot=textarea", () => {
      render(<Textarea placeholder="campo" />);
      expect(screen.getByPlaceholderText("campo")).toHaveAttribute("data-slot", "textarea");
    });

    it("deve respeitar aria-label quando fornecido", () => {
      render(<Textarea aria-label="observações do processo" />);
      expect(screen.getByRole("textbox", { name: "observações do processo" })).toBeInTheDocument();
    });

    it("deve respeitar rows quando fornecido", () => {
      render(<Textarea rows={5} placeholder="campo" />);
      expect(screen.getByPlaceholderText("campo")).toHaveAttribute("rows", "5");
    });
  });
});
