import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Checkbox } from "../checkbox.component";

describe("Checkbox", () => {
  it("renders correctly", () => {
    render(<Checkbox id="terms" />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it("toggles state when clicked", async () => {
    render(<Checkbox id="terms" />);
    const checkbox = screen.getByRole("checkbox");

    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    await userEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it("can be disabled", () => {
    render(<Checkbox disabled />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeDisabled();
  });

  it("renders in indeterminate state (simulated by prop if component supports it, or just checked)", () => {
    render(<Checkbox checked="indeterminate" />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("data-state", "indeterminate");
  });
});
