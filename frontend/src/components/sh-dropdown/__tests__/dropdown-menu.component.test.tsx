import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/sh-dropdown/dropdown-menu.component";

// Simpler mock for Radix UI
vi.mock("radix-ui", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    DropdownMenu: {
      Root: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-root">{children}</div>,
      Trigger: ({ children }: { children: React.ReactNode }) => <button data-testid="dropdown-trigger">{children}</button>,
      Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
      Content: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-content">{children}</div>,
      Item: ({ children, onSelect }: { children: React.ReactNode; onSelect?: () => void }) => (
        <div data-testid="dropdown-item" onClick={onSelect} onKeyDown={onSelect} role="button" tabIndex={0}>
          {children}
        </div>
      ),
    },
  };
});

describe("DropdownMenu", () => {
  it("opens and displays items correctly", async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    // In my mock, everything is rendered inline
    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });

  it("calls action when item is clicked", async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={handleSelect}>Click Me</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const item = screen.getByText("Click Me");
    await user.click(item);

    expect(handleSelect).toHaveBeenCalled();
  });
});
