import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Input } from "../input.component";

describe("Input", () => {
  describe("renderização", () => {
    it("deve renderizar com as props padrão", () => {
      render(<Input placeholder="Digite algo" />);
      const input = screen.getByPlaceholderText("Digite algo");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("data-slot", "input");
    });

    it("deve aplicar o type correto", () => {
      render(<Input type="email" placeholder="e-mail" />);
      expect(screen.getByPlaceholderText("e-mail")).toHaveAttribute("type", "email");
    });

    it("deve aplicar type password", () => {
      render(<Input type="password" placeholder="senha" />);
      expect(screen.getByPlaceholderText("senha")).toHaveAttribute("type", "password");
    });
  });

  describe("estados", () => {
    it("deve estar desabilitado quando a prop disabled é verdadeira", () => {
      render(<Input disabled placeholder="bloqueado" />);
      expect(screen.getByPlaceholderText("bloqueado")).toBeDisabled();
    });

    it("deve aplicar aria-invalid quando em estado de erro", () => {
      render(<Input aria-invalid="true" placeholder="inválido" />);
      expect(screen.getByPlaceholderText("inválido")).toHaveAttribute("aria-invalid", "true");
    });

    it("deve exibir valor padrão quando defaultValue é fornecido", () => {
      render(<Input defaultValue="texto inicial" placeholder="campo" />);
      expect(screen.getByPlaceholderText("campo")).toHaveValue("texto inicial");
    });
  });

  describe("interação", () => {
    it("deve aceitar digitação do usuário", async () => {
      render(<Input placeholder="campo" />);
      const input = screen.getByPlaceholderText("campo");
      await userEvent.type(input, "Olá mundo");
      expect(input).toHaveValue("Olá mundo");
    });

    it("deve chamar onChange ao digitar", async () => {
      const onChange = vi.fn();
      render(<Input placeholder="campo" onChange={onChange} />);
      await userEvent.type(screen.getByPlaceholderText("campo"), "a");
      expect(onChange).toHaveBeenCalled();
    });

    it("deve receber foco ao ser clicado", async () => {
      render(<Input placeholder="campo" />);
      const input = screen.getByPlaceholderText("campo");
      await userEvent.click(input);
      expect(input).toHaveFocus();
    });
  });

  describe("acessibilidade", () => {
    it("deve ter role textbox", () => {
      render(<Input placeholder="campo" />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("deve respeitar aria-label quando fornecido", () => {
      render(<Input aria-label="buscar usuário" />);
      expect(screen.getByRole("textbox", { name: "buscar usuário" })).toBeInTheDocument();
    });

    it("deve ter data-slot=input", () => {
      render(<Input placeholder="x" />);
      expect(screen.getByPlaceholderText("x")).toHaveAttribute("data-slot", "input");
    });
  });
});
