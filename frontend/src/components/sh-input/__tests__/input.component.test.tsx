import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Input } from "@components/sh-input/input.component";

describe("Input", () => {
  it("renders correctly", () => {
    // If type is not provided, it defaults to text in the browser, but might not have the attribute explicitly
    render(<Input placeholder="Test Input" />);
    const input = screen.getByPlaceholderText("Test Input") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.type).toBe("text");
  });

  it("handles value changes", async () => {
    const onChange = vi.fn();
    render(<Input placeholder="Type here" onChange={onChange} />);
    const input = screen.getByPlaceholderText("Type here");

    await userEvent.type(input, "Hello");
    expect(onChange).toHaveBeenCalled();
    expect(input).toHaveValue("Hello");
  });

  it("can be disabled", () => {
    render(<Input disabled placeholder="Disabled" />);
    const input = screen.getByPlaceholderText("Disabled");
    expect(input).toBeDisabled();
  });

  it("renders with different types", () => {
    const { rerender } = render(<Input type="email" placeholder="Email" />);
    expect(screen.getByPlaceholderText("Email")).toHaveAttribute("type", "email");

    rerender(<Input type="password" placeholder="Password" />);
    expect(screen.getByPlaceholderText("Password")).toHaveAttribute("type", "password");

    rerender(<Input type="number" placeholder="Number" />);
    expect(screen.getByPlaceholderText("Number")).toHaveAttribute("type", "number");
  });

  it("applies custom className", () => {
    render(<Input className="custom-input" placeholder="Custom" />);
    expect(screen.getByPlaceholderText("Custom")).toHaveClass("custom-input");
  });

  it("handles focus and blur events", async () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    render(<Input onFocus={onFocus} onBlur={onBlur} placeholder="Focus test" />);
    const input = screen.getByPlaceholderText("Focus test");

    await userEvent.click(input);
    expect(onFocus).toHaveBeenCalled();

    await userEvent.tab();
    expect(onBlur).toHaveBeenCalled();
  });
});
