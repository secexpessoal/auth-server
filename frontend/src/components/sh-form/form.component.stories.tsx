import type { Meta, StoryObj } from "@storybook/react-vite";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./form.component";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

const meta: Meta<typeof Form> = {
  title: "Components/Form",
  component: Form,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Form>;

export const Default: Story = {
  render: () => {
    const form = useForm({ defaultValues: { username: "" } });

    return (
      <Form {...form}>
        <form className="w-full max-w-sm space-y-4" onSubmit={(e) => e.preventDefault()}>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <input
                    {...field}
                    type="text"
                    placeholder="shadcn"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </FormControl>
                <FormDescription>This is your public display name.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    );
  },
};

export const WithError: Story = {
  render: () => {
    const form = useForm({ defaultValues: { username: "" } });

    useEffect(() => {
      form.setError("username", { type: "manual", message: "Username is required." });
    }, [form]);

    return (
      <Form {...form}>
        <form className="w-full max-w-sm space-y-4" onSubmit={(e) => e.preventDefault()}>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <input
                    {...field}
                    type="text"
                    placeholder="shadcn"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </FormControl>
                <FormDescription>This is your public display name.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    );
  },
};
