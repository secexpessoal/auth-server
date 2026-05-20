import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../button.component";

describe("Button", () => {
  describe("renderização", () => {
    it("deve renderizar com as props padrão", () => {
      render(<Button>Clique aqui</Button>);
      const btn = screen.getByRole("button", { name: /clique aqui/i });
      expect(btn).toHaveAttribute("data-variant", "default");
      expect(btn).toHaveAttribute("data-size", "default");
      expect(btn).toHaveAttribute("data-slot", "button");
    });

    it("deve aplicar a variante destructive corretamente", () => {
      render(<Button variant="destructive">Excluir</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("data-variant", "destructive");
    });

    it("deve aplicar a variante outline corretamente", () => {
      render(<Button variant="outline">Cancelar</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("data-variant", "outline");
    });

    it("deve aplicar a variante secondary corretamente", () => {
      render(<Button variant="secondary">Secundário</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("data-variant", "secondary");
    });

    it("deve aplicar a variante ghost corretamente", () => {
      render(<Button variant="ghost">Sutil</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("data-variant", "ghost");
    });

    it("deve aplicar a variante success corretamente", () => {
      render(<Button variant="success">Salvo</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("data-variant", "success");
    });

    it("deve aplicar o tamanho sm corretamente", () => {
      render(<Button size="sm">Pequeno</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("data-size", "sm");
    });

    it("deve aplicar o tamanho lg corretamente", () => {
      render(<Button size="lg">Grande</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("data-size", "lg");
    });
  });

  describe("estados", () => {
    it("deve estar desabilitado quando a prop disabled é verdadeira", () => {
      render(<Button disabled>Desabilitado</Button>);
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("não deve disparar onClick quando desabilitado", async () => {
      const onClick = vi.fn();
      render(
        <Button disabled onClick={onClick}>
          Desabilitado
        </Button>,
      );
      await userEvent.click(screen.getByRole("button"));
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe("interação", () => {
    it("deve chamar onClick ao ser clicado", async () => {
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Ação</Button>);
      await userEvent.click(screen.getByRole("button"));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("deve ser ativado pela tecla Enter", async () => {
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Ação</Button>);
      screen.getByRole("button").focus();
      await userEvent.keyboard("{Enter}");
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("deve ser ativado pela tecla Space", async () => {
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Ação</Button>);
      screen.getByRole("button").focus();
      await userEvent.keyboard(" ");
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("acessibilidade", () => {
    it("deve ter role button", () => {
      render(<Button>Ação</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("deve respeitar aria-label quando fornecido", () => {
      render(<Button aria-label="fechar janela">×</Button>);
      expect(screen.getByRole("button", { name: "fechar janela" })).toBeInTheDocument();
    });

    it("deve expor data-slot=button", () => {
      render(<Button>Botão</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("data-slot", "button");
    });
  });
});
