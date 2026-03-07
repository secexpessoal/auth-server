import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@components/sh-card/card.component";

describe("Card", () => {
  it("renders card structure correctly", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    );

    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();

    expect(document.querySelector('[data-slot="card"]')).toBeInTheDocument();
  });

  it("applies custom className to parts", () => {
    const { container } = render(<Card className="custom-card" />);
    const card = container.querySelector('[data-slot="card"]');
    expect(card).toHaveClass("custom-card");
  });
});
