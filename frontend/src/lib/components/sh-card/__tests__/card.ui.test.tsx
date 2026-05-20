import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../card.component";

describe("Card", () => {
  const user = userEvent.setup();

  describe("renderização", () => {
    it("deve renderizar com as props padrão", () => {
      render(<Card data-testid="card">conteúdo</Card>);
      const card = screen.getByTestId("card");
      expect(card).toBeInTheDocument();
      expect(card).toHaveAttribute("data-slot", "card");
    });

    it("deve renderizar CardHeader com CardTitle e CardDescription", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Processo 001/2024</CardTitle>
            <CardDescription>Aposentadoria por tempo de contribuição</CardDescription>
          </CardHeader>
        </Card>,
      );
      expect(screen.getByText("Processo 001/2024")).toBeInTheDocument();
      expect(screen.getByText("Aposentadoria por tempo de contribuição")).toBeInTheDocument();
    });

    it("deve renderizar CardContent com data-slot correto", () => {
      render(
        <Card>
          <CardContent data-testid="content">Corpo do card</CardContent>
        </Card>,
      );
      expect(screen.getByTestId("content")).toHaveAttribute("data-slot", "card-content");
    });

    it("deve renderizar CardFooter com data-slot correto", () => {
      render(
        <Card>
          <CardFooter data-testid="footer">Rodapé</CardFooter>
        </Card>,
      );
      expect(screen.getByTestId("footer")).toHaveAttribute("data-slot", "card-footer");
    });

    it("deve renderizar CardAction no cabeçalho", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Título</CardTitle>
            <CardAction data-testid="action">Ação</CardAction>
          </CardHeader>
        </Card>,
      );
      expect(screen.getByTestId("action")).toHaveAttribute("data-slot", "card-action");
    });
  });

  describe("estados", () => {
    it("deve aplicar className customizado", () => {
      render(<Card className="custom-card" data-testid="card" />);
      expect(screen.getByTestId("card")).toHaveClass("custom-card");
    });

    it("deve renderizar card vazio sem erros", () => {
      render(<Card data-testid="card" />);
      expect(screen.getByTestId("card")).toBeInTheDocument();
    });
  });

  describe("interação", () => {
    it("deve aceitar onClick quando fornecido", async () => {
      const onClick = vi.fn();
      render(
        <Card data-testid="card" onClick={onClick}>
          Clicável
        </Card>,
      );
      await user.click(screen.getByTestId("card"));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("acessibilidade", () => {
    it("deve ter data-slot=card para identificação", () => {
      render(<Card data-testid="card" />);
      expect(screen.getByTestId("card")).toHaveAttribute("data-slot", "card");
    });

    it("deve ter data-slot=card-header no cabeçalho", () => {
      render(
        <Card>
          <CardHeader data-testid="header">Cabeçalho</CardHeader>
        </Card>,
      );
      expect(screen.getByTestId("header")).toHaveAttribute("data-slot", "card-header");
    });
  });
});
