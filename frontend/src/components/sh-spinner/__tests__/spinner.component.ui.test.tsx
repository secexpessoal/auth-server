import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Spinner } from "@components/sh-spinner/spinner.component";

describe("Spinner", () => {
  it("renderiza com aria-label de carregamento", () => {
    // Arrange & Act
    render(<Spinner />);

    // Assert
    expect(screen.getByLabelText("Loading")).toBeInTheDocument();
  });

  it("renderiza com role status", () => {
    // Arrange & Act
    render(<Spinner />);

    // Assert
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("aplica className customizado", () => {
    // Arrange & Act
    render(<Spinner className="text-primary" data-testid="spinner" />);

    // Assert
    expect(screen.getByTestId("spinner")).toHaveClass("text-primary");
  });
});
