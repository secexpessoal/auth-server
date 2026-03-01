import { render, screen } from "@testing-library/react";

import { describe, expect, it } from "vitest";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../form.component";
import type { MinimalFieldApi } from "../form.context";

describe("Form Components", () => {
  const mockField: MinimalFieldApi = {
    name: "testField",
    state: {
      meta: {
        errors: [],
      },
    },
  };

  const mockFieldError: MinimalFieldApi = {
    name: "testFieldError",
    state: {
      meta: {
        errors: ["This field is required"],
      },
    },
  };

  it("renders a simple form correctly", () => {
    render(
      <Form data-testid="test-form">
        <FormField field={mockField}>
          <FormItem>
            <FormLabel>Test Label</FormLabel>
            <FormControl>
              <input placeholder="Test Input" />
            </FormControl>
            <FormDescription>Test Description</FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>
      </Form>,
    );

    expect(screen.getByTestId("test-form")).toBeInTheDocument();
    expect(screen.getByText("Test Label")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Test Input")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
    expect(screen.queryByText("This field is required")).not.toBeInTheDocument();
  });

  it("renders with error state correctly", () => {
    render(
      <FormField field={mockFieldError}>
        <FormItem>
          <FormLabel>Error Label</FormLabel>
          <FormControl>
            <input placeholder="Error Input" />
          </FormControl>
          <FormDescription>Error Description</FormDescription>
          <FormMessage />
        </FormItem>
      </FormField>,
    );

    const errorMessage = screen.getByText("This field is required");
    expect(errorMessage).toBeInTheDocument();

    const label = screen.getByText("Error Label");
    expect(label).toHaveAttribute("data-error", "true");

    const control = screen.getByPlaceholderText("Error Input");
    expect(control).toHaveAttribute("aria-invalid", "true");
  });

  it("renders custom FormMessage correctly when there is no error", () => {
    render(
      <FormField field={mockField}>
        <FormItem>
          <FormMessage>Custom Message</FormMessage>
        </FormItem>
      </FormField>,
    );

    expect(screen.getByText("Custom Message")).toBeInTheDocument();
  });
});
