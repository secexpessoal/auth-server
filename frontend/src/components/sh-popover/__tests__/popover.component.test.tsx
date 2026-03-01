import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Popover, PopoverContent, PopoverTrigger } from "../popover.component";

describe("Popover", () => {
  it("renders trigger and shows content on click", async () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>,
    );

    const trigger = screen.getByRole("button", { name: /open/i });
    expect(trigger).toBeInTheDocument();
    expect(screen.queryByText("Content")).not.toBeInTheDocument();

    await userEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Content")).toBeInTheDocument();
    });
  });

  it("can be opened with focus and closed with Escape", async () => {
    render(
      <Popover>
        <PopoverTrigger>Trigger</PopoverTrigger>
        <PopoverContent>Popover Body</PopoverContent>
      </Popover>,
    );

    const trigger = screen.getByRole("button", { name: /trigger/i });
    await userEvent.click(trigger);
    expect(await screen.findByText("Popover Body")).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByText("Popover Body")).not.toBeInTheDocument();
    });
  });

  it("handles nested interactive elements", async () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>
          <button>Submit</button>
        </PopoverContent>
      </Popover>,
    );

    await userEvent.click(screen.getByText("Open"));
    const submitBtn = await screen.findByRole("button", { name: "Submit" });
    expect(submitBtn).toBeInTheDocument();
  });
});
