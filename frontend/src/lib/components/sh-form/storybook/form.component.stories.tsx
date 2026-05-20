import type { Meta, StoryObj } from "@storybook/react-vite";
import { within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../form.component";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Input } from "@lib/components/sh-input/input.component";
import { expect } from "vitest";

const meta = {
  title: "UI/Form",
  tags: ["autodocs"],
  component: Form,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof Form>;

function ExampleForm() {
  const form = useForm<{ name: string }>({ defaultValues: { name: "" } });

  return (
    <Form {...form}>
      <form className="w-full max-w-sm space-y-4" onSubmit={(e) => e.preventDefault()}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Digite seu nome" {...field} />
              </FormControl>
              <FormDescription>Informe o nome como aparece no documento.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit">Enviar</button>
      </form>
    </Form>
  );
}

function ErrorForm() {
  const form = useForm<{ name: string }>({ defaultValues: { name: "" } });

  useEffect(() => {
    form.setError("name", { type: "manual", message: "Nome é obrigatório." });
  }, [form]);

  return (
    <Form {...form}>
      <form className="w-full max-w-sm space-y-4" onSubmit={(e) => e.preventDefault()}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Digite seu nome" {...field} />
              </FormControl>
              <FormDescription>Informe o nome como aparece no documento.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit">Enviar</button>
      </form>
    </Form>
  );
}

export const Default: Story = {
  render: () => <ExampleForm />,
};

export const WithError: Story = {
  render: () => <ErrorForm />,
};

export const Interactive: Story = {
  render: () => <ExampleForm />,
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("Digite seu nome");
    await user.click(input);
    await expect(input).toHaveFocus();
    await user.type(input, "João da Silva");
    await expect(input).toHaveValue("João da Silva");
  },
};
