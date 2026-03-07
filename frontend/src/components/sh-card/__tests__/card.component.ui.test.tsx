import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@components/sh-card/card.component";

describe("Card", () => {
  it("renderiza o card com conteúdo filho", () => {
    // Arrange & Act
    render(<Card data-testid="card">conteúdo</Card>);

    // Assert
    const card = screen.getByTestId("card");
    expect(card).toHaveAttribute("data-slot", "card");
    expect(card).toHaveTextContent("conteúdo");
  });

  it("renderiza CardHeader com CardTitle e CardDescription", () => {
    // Arrange & Act
    render(
      <Card>
        <CardHeader>
          <CardTitle>Título</CardTitle>
          <CardDescription>Descrição do card</CardDescription>
        </CardHeader>
      </Card>,
    );

    // Assert
    expect(screen.getByText("Título")).toBeInTheDocument();
    expect(screen.getByText("Descrição do card")).toBeInTheDocument();
  });

  it("renderiza CardContent e CardFooter corretamente", () => {
    // Arrange & Act
    render(
      <Card>
        <CardContent data-testid="content">Corpo</CardContent>
        <CardFooter data-testid="footer">Rodapé</CardFooter>
      </Card>,
    );

    // Assert
    expect(screen.getByTestId("content")).toHaveAttribute("data-slot", "card-content");
    expect(screen.getByTestId("footer")).toHaveAttribute("data-slot", "card-footer");
  });

  it("aplica className customizado", () => {
    // Arrange & Act
    render(<Card className="custom-card" data-testid="card" />);

    // Assert
    expect(screen.getByTestId("card")).toHaveClass("custom-card");
  });
});
