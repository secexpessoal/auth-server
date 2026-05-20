import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Spinner } from "../spinner.component";

describe("Spinner", () => {
  describe("renderização", () => {
    it("deve renderizar com as props padrão", () => {
      render(<Spinner />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("deve exibir aria-label de carregamento", () => {
      render(<Spinner />);
      expect(screen.getByLabelText("Loading")).toBeInTheDocument();
    });

    it("deve aplicar className customizado", () => {
      render(<Spinner className="text-primary" data-testid="spinner" />);
      expect(screen.getByTestId("spinner")).toHaveClass("text-primary");
    });
  });

  describe("estados", () => {
    it("deve ter animação de spin aplicada", () => {
      render(<Spinner data-testid="spinner" />);
      expect(screen.getByTestId("spinner")).toHaveClass("animate-spin");
    });

    it("deve aceitar tamanho customizado via className", () => {
      render(<Spinner className="size-8" data-testid="spinner" />);
      expect(screen.getByTestId("spinner")).toHaveClass("size-8");
    });
  });

  describe("interação", () => {
    it("deve aceitar props SVG adicionais", () => {
      render(<Spinner data-testid="spinner" aria-describedby="loading-text" />);
      expect(screen.getByTestId("spinner")).toHaveAttribute("aria-describedby", "loading-text");
    });
  });

  describe("acessibilidade", () => {
    it("deve ter role=status para leitores de tela", () => {
      render(<Spinner />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("deve ter aria-label acessível", () => {
      render(<Spinner />);
      expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Loading");
    });
  });
});
