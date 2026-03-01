import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Spinner } from "../spinner.component";

describe("Spinner", () => {
  it("renders correctly", () => {
    render(<Spinner />);
    // Check for role="status"
    const spinner = screen.getByRole("status");
    expect(spinner).toBeInTheDocument();
  });

  it("has correct accessibility attributes", () => {
    render(<Spinner />);
    const spinner = screen.getByRole("status");
    expect(spinner).toHaveAttribute("aria-label", "Loading");
  });

  it("applies custom className and animation", () => {
    render(<Spinner className="custom-spinner" />);
    const spinner = screen.getByRole("status");
    expect(spinner).toHaveClass("custom-spinner");
    expect(spinner).toHaveClass("animate-spin");
  });
});
