import type { Meta, StoryObj } from "@storybook/react-vite";
import { within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "../../sh-input/input.component";
import { Label } from "../label.component";
import { expect } from "vitest";

const meta = {
  title: "UI/Label",
  component: Label,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    htmlFor: {
      description: "ID do elemento de formulário associado",
      control: "text",
    },
    children: {
      description: "Texto do rótulo",
      control: "text",
    },
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Nome completo",
  },
};

export const Required: Story = {
  render: () => (
    <Label htmlFor="obrigatorio">
      E-mail <span className="text-destructive">*</span>
    </Label>
  ),
};

export const AssociatedWithInput: Story = {
  render: () => (
    <div className="flex flex-col gap-2 w-64">
      <Label htmlFor="nome-completo">Nome completo</Label>
      <Input id="nome-completo" placeholder="João da Silva" />
    </div>
  ),
};

export const Interactive: Story = {
  render: () => (
    <div className="flex flex-col gap-2 w-64">
      <Label htmlFor="campo-interativo">Clique no rótulo para focar</Label>
      <Input id="campo-interativo" placeholder="Foco transferido via label" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const canvas = within(canvasElement);
    const label = canvas.getByText("Clique no rótulo para focar");
    await expect(label).toBeInTheDocument();
    await user.click(label);
    const input = canvas.getByRole("textbox");
    await expect(input).toHaveFocus();
  },
};
