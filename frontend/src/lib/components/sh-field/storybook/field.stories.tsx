import type { Meta, StoryObj } from "@storybook/react-vite";
import { within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@lib/components/sh-input/input.component";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel, FieldSet } from "../field.component";
import { expect } from "vitest";

const meta = {
  title: "UI/Field",
  component: Field,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    orientation: {
      description: "Orientação do campo",
      control: "select",
      options: ["vertical", "horizontal", "responsive"],
    },
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof Field>;

export const Default: Story = {
  render: () => (
    <Field className="w-80">
      <FieldLabel htmlFor="nome">Nome completo</FieldLabel>
      <FieldContent>
        <Input id="nome" placeholder="Digite seu nome" />
      </FieldContent>
      <FieldDescription>Informe o nome como aparece no documento.</FieldDescription>
    </Field>
  ),
};

export const WithError: Story = {
  render: () => (
    <Field className="w-80">
      <FieldLabel htmlFor="email">E-mail</FieldLabel>
      <FieldContent>
        <Input id="email" placeholder="email@exemplo.com" aria-invalid="true" />
      </FieldContent>
      <FieldError errors={[{ message: "E-mail é obrigatório" }]} />
    </Field>
  ),
};

export const HorizontalOrientation: Story = {
  render: () => (
    <FieldSet className="w-96">
      <Field orientation="horizontal">
        <FieldLabel htmlFor="cargo">Cargo</FieldLabel>
        <FieldContent>
          <Input id="cargo" placeholder="Ex: Analista" />
        </FieldContent>
      </Field>
    </FieldSet>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Field className="w-80">
      <FieldLabel htmlFor="interativo-email">E-mail</FieldLabel>
      <FieldContent>
        <Input id="interativo-email" placeholder="email@exemplo.com" />
      </FieldContent>
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const canvas = within(canvasElement);
    const label = canvas.getByText("E-mail");
    await user.click(label);
    const input = canvas.getByPlaceholderText("email@exemplo.com");
    await expect(input).toHaveFocus();
  },
};
