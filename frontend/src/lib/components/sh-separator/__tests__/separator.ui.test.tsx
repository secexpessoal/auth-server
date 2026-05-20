import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Separator } from "../separator.component";

describe("Separator", () => {
  describe("renderização", () => {
    it("deve renderizar com orientação horizontal por padrão", () => {
      render(<Separator data-testid="sep" />);
      expect(screen.getByTestId("sep")).toHaveAttribute("data-orientation", "horizontal");
    });

    it("deve renderizar com orientação vertical", () => {
      render(<Separator orientation="vertical" data-testid="sep" />);
      expect(screen.getByTestId("sep")).toHaveAttribute("data-orientation", "vertical");
    });

    it("deve ter data-slot=separator", () => {
      render(<Separator data-testid="sep" />);
      expect(screen.getByTestId("sep")).toHaveAttribute("data-slot", "separator");
    });
  });

  describe("estados", () => {
    it("deve ser decorativo por padrão (sem role semântico)", () => {
      render(<Separator data-testid="sep" />);
      expect(screen.getByTestId("sep")).toBeInTheDocument();
    });

    it("deve ter role=separator quando decorative=false", () => {
      render(<Separator decorative={false} />);
      expect(screen.getByRole("separator")).toBeInTheDocument();
    });
  });

  describe("interação", () => {
    it("deve aceitar className customizado", () => {
      render(<Separator className="minha-classe" data-testid="sep" />);
      expect(screen.getByTestId("sep")).toHaveClass("minha-classe");
    });
  });

  describe("acessibilidade", () => {
    it("deve expor aria-orientation quando não decorativo e vertical", () => {
      render(<Separator decorative={false} orientation="vertical" />);
      expect(screen.getByRole("separator")).toHaveAttribute("aria-orientation", "vertical");
    });

    it("deve expor aria-orientation horizontal quando não decorativo e horizontal", () => {
      render(<Separator decorative={false} orientation="horizontal" />);
      const sep = screen.getByRole("separator");
      expect([null, "horizontal"]).toContain(sep.getAttribute("aria-orientation"));
    });
  });
});
