import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Label } from "@components/sh-label/label.component";

describe("Label", () => {
  it("renders correctly", () => {
    render(<Label>Standard Label</Label>);
    const label = screen.getByText("Standard Label");
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute("data-slot", "label");
  });

  it("applies custom className", () => {
    render(<Label className="custom-label">Custom</Label>);
    expect(screen.getByText("Custom")).toHaveClass("custom-label");
  });

  it("associates with input correctly via htmlFor", () => {
    render(
      <>
        <Label htmlFor="test-input">Field</Label>
        <input id="test-input" />
      </>,
    );
    const label = screen.getByText("Field");
    expect(label).toHaveAttribute("for", "test-input");
  });
});
