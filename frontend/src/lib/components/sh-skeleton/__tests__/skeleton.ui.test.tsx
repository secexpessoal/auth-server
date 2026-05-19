import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Skeleton } from "../skeleton.component";

describe("Skeleton", () => {
  describe("renderização", () => {
    it("deve renderizar com as props padrão", () => {
      render(<Skeleton data-testid="sk" />);
      const el = screen.getByTestId("sk");
      expect(el).toBeInTheDocument();
      expect(el).toHaveAttribute("data-slot", "skeleton");
    });

    it("deve aplicar className customizado", () => {
      render(<Skeleton data-testid="sk" className="w-32 h-4" />);
      expect(screen.getByTestId("sk")).toHaveClass("w-32", "h-4");
    });

    it("deve renderizar filhos quando fornecidos", () => {
      render(<Skeleton>conteúdo carregando</Skeleton>);
      expect(screen.getByText("conteúdo carregando")).toBeInTheDocument();
    });
  });

  describe("estados", () => {
    it("deve ter animação pulse aplicada", () => {
      render(<Skeleton data-testid="sk" />);
      expect(screen.getByTestId("sk")).toHaveClass("animate-pulse");
    });

    it("deve aceitar múltiplas classes de dimensão", () => {
      render(<Skeleton data-testid="sk" className="w-full h-12 rounded-xl" />);
      const el = screen.getByTestId("sk");
      expect(el).toHaveClass("w-full", "h-12", "rounded-xl");
    });
  });

  describe("interação", () => {
    it("deve aceitar atributos HTML adicionais", () => {
      render(<Skeleton data-testid="sk" aria-hidden="true" />);
      expect(screen.getByTestId("sk")).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("acessibilidade", () => {
    it("deve ter data-slot=skeleton para identificação", () => {
      render(<Skeleton data-testid="sk" />);
      expect(screen.getByTestId("sk")).toHaveAttribute("data-slot", "skeleton");
    });

    it("deve ser ocultável de leitores de tela com aria-hidden", () => {
      render(<Skeleton data-testid="sk" aria-hidden="true" />);
      expect(screen.getByTestId("sk")).toHaveAttribute("aria-hidden", "true");
    });
  });
});
