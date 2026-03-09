import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Separator } from "@components/sh-separator/separator.component";

describe("Separator", () => {
  it("renders correctly as a non-decorative separator", () => {
    const { getByRole } = render(<Separator decorative={false} />);
    const separator = getByRole("separator");
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveAttribute("data-orientation", "horizontal");
  });

  it("renders as decorative by default", () => {
    const { container } = render(<Separator />);
    // When decorative=true, it doesn't have a role, so we find it by data-slot
    const separator = container.querySelector('[data-slot="separator"]');
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveAttribute("data-orientation", "horizontal");
  });

  it("applies vertical orientation", () => {
    const { getByRole } = render(<Separator orientation="vertical" decorative={false} />);
    const separator = getByRole("separator");
    expect(separator).toHaveAttribute("data-orientation", "vertical");
  });

  it("applies custom className", () => {
    const { container } = render(<Separator className="my-separator" />);
    const separator = container.querySelector('[data-slot="separator"]');
    expect(separator).toHaveClass("my-separator");
  });
});
