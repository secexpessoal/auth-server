import type { Meta, StoryObj } from "@storybook/react-vite";
import { within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Label } from "../../sh-label/label.component";
import { Checkbox } from "../checkbox.component";
import { expect } from "vitest";

const meta = {
  title: "UI/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    disabled: {
      description: "Desabilita o checkbox",
      control: "boolean",
    },
    defaultChecked: {
      description: "Estado inicial marcado (modo não controlado)",
      control: "boolean",
    },
    checked: {
      description: "Estado marcado controlado",
      control: "boolean",
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="termos" />
      <Label htmlFor="termos">Aceitar termos e condições</Label>
    </div>
  ),
};

export const CheckedByDefault: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="marcado" defaultChecked />
      <Label htmlFor="marcado">Já selecionado</Label>
    </div>
  ),
};

export const DisabledState: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="desabilitado" disabled />
      <Label htmlFor="desabilitado">Opção indisponível</Label>
    </div>
  ),
};

export const DisabledChecked: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="desab-marcado" disabled defaultChecked />
      <Label htmlFor="desab-marcado">Selecionado e indisponível</Label>
    </div>
  ),
};

export const WithError: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="com-erro" aria-invalid="true" />
      <Label htmlFor="com-erro">Campo obrigatório</Label>
    </div>
  ),
};

export const Interactive: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="interativo" />
      <Label htmlFor="interativo">Clique para marcar</Label>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox");
    await expect(checkbox).not.toBeChecked();
    await user.click(checkbox);
    await expect(checkbox).toHaveFocus();
    await expect(checkbox).toBeChecked();
    await user.click(checkbox);
    await expect(checkbox).not.toBeChecked();
  },
};
