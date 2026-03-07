import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@components/sh-form/form.component";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

const TestForm = ({ defaultValues, hasError }: { defaultValues: any; hasError?: boolean }) => {
  const form = useForm({ defaultValues });

  useEffect(() => {
    if (hasError) {
      form.setError("testField", { message: "This field is required" });
    }
  }, [form, hasError]);

  return (
    <Form {...form}>
      <form data-testid="test-form" onSubmit={(e) => e.preventDefault()}>
        <FormField
          control={form.control}
          name="testField"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Test Label</FormLabel>
              <FormControl>
                <input {...field} placeholder="Test Input" />
              </FormControl>
              <FormDescription>Test Description</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

const CustomMessageForm = () => {
  const form = useForm({ defaultValues: { testField: "" } });

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()}>
        <FormField
          control={form.control}
          name="testField"
          render={() => (
            <FormItem>
              <FormMessage>Custom Message</FormMessage>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

describe("Form Components", () => {
  it("renders a simple form correctly", () => {
    render(<TestForm defaultValues={{ testField: "" }} />);

    expect(screen.getByTestId("test-form")).toBeInTheDocument();
    expect(screen.getByText("Test Label")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Test Input")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
    expect(screen.queryByText("This field is required")).not.toBeInTheDocument();
  });

  it("renders with error state correctly", async () => {
    render(<TestForm defaultValues={{ testField: "" }} hasError />);

    const errorMessage = await screen.findByText("This field is required");
    expect(errorMessage).toBeInTheDocument();

    const label = screen.getByText("Test Label");
    expect(label).toHaveClass("text-destructive");

    const control = screen.getByPlaceholderText("Test Input");
    expect(control).toHaveAttribute("aria-invalid", "true");
  });

  it("renders custom FormMessage correctly when there is no error", () => {
    render(<CustomMessageForm />);

    expect(screen.getByText("Custom Message")).toBeInTheDocument();
  });
});
