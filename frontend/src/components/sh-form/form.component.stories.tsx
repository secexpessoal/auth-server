import type { Meta, StoryObj } from "@storybook/react-vite";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./form.component";
import type { MinimalFieldApi } from "./form.context";

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

const defaultField: MinimalFieldApi = {
  name: "username",
  state: {
    meta: {
      errors: [],
    },
  },
};

const errorField: MinimalFieldApi = {
  name: "username-error",
  state: {
    meta: {
      errors: ["Username is required."],
    },
  },
};

export const Default: Story = {
  render: () => (
    <Form className="w-full max-w-sm space-y-4">
      <FormField field={defaultField}>
        <FormItem>
          <FormLabel>Username</FormLabel>
          <FormControl>
            <input
              type="text"
              placeholder="shadcn"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </FormControl>
          <FormDescription>This is your public display name.</FormDescription>
          <FormMessage />
        </FormItem>
      </FormField>
    </Form>
  ),
};

export const WithError: Story = {
  render: () => (
    <Form className="w-full max-w-sm space-y-4">
      <FormField field={errorField}>
        <FormItem>
          <FormLabel>Username</FormLabel>
          <FormControl>
            <input
              type="text"
              placeholder="shadcn"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </FormControl>
          <FormDescription>This is your public display name.</FormDescription>
          <FormMessage />
        </FormItem>
      </FormField>
    </Form>
  ),
};
