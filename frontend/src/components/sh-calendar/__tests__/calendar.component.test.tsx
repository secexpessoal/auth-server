import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Calendar } from "@components/sh-calendar/calendar.component";

describe("Calendar", () => {
  it("renders correctly", () => {
    render(<Calendar mode="single" />);
    // Check for the table/grid that represents the calendar
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("calls onSelect when a date is clicked", async () => {
    const date = new Date(2024, 0, 1); // Jan 1st, 2024
    const onSelect = vi.fn();

    render(<Calendar mode="single" month={date} onSelect={onSelect} />);

    // Find a button with text "15" to be safe and avoid multi-match from outside days
    const day15 = screen.getAllByRole("button").find((btn) => btn.textContent === "15");

    if (!day15) throw new Error("Day 15 not found");

    await userEvent.click(day15);
    expect(onSelect).toHaveBeenCalled();
  });

  it("renders with multiple months in range mode", () => {
    render(<Calendar mode="range" numberOfMonths={2} />);
    const grids = screen.getAllByRole("grid");
    expect(grids).toHaveLength(2);
  });

  it("disables specific days correctly", () => {
    const disabledDate = new Date(2024, 0, 15);
    render(<Calendar mode="single" month={disabledDate} disabled={disabledDate} />);

    const day15 = screen.getAllByRole("button").find((btn) => btn.textContent === "15");

    expect(day15).toBeDisabled();
  });
});
