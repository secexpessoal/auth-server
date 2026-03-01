import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "../select.component";

describe("Select", () => {
  it("renders trigger and shows options on click", async () => {
    render(
      <Select>
        <SelectTrigger aria-label="Select fruit">
          <SelectValue placeholder="Select option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>,
    );

    const trigger = screen.getByRole("combobox");
    expect(trigger).toBeInTheDocument();
    expect(screen.getByText("Select option")).toBeInTheDocument();

    await userEvent.click(trigger);

    // Using waitFor for Radix animations/portals
    await waitFor(() => {
      expect(screen.getByText("Option 1")).toBeInTheDocument();
    });
    expect(screen.getByText("Option 2")).toBeInTheDocument();
  });

  it("selects an option correctly", async () => {
    render(
      <Select defaultValue="option1">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>,
    );

    expect(screen.getByText("Option 1")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("combobox"));
    const option2 = await screen.findByText("Option 2");
    await userEvent.click(option2);

    // After selection, option 2 should be shown in the trigger
    expect(await screen.findByText("Option 2")).toBeInTheDocument();
  });

  it("handles groups and labels", async () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Group Label</SelectLabel>
            <SelectItem value="opt1">Option 1</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>,
    );

    await userEvent.click(screen.getByRole("combobox"));
    expect(await screen.findByText("Group Label")).toBeInTheDocument();
    expect(screen.getByText("Option 1")).toBeInTheDocument();
  });

  it("handles disabled state", () => {
    render(
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Disabled" />
        </SelectTrigger>
      </Select>,
    );
    expect(screen.getByRole("combobox")).toBeDisabled();
  });
});
