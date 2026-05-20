import type { Meta, StoryObj } from "@storybook/react-vite";
import { within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Separator } from "../separator.component";
import { expect } from "vitest";

const meta = {
  title: "UI/Separator",
  component: Separator,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    orientation: {
      description: "Orientação do separador",
      control: "select",
      options: ["horizontal", "vertical"],
    },
    decorative: {
      description: "Quando verdadeiro, oculta do accessibility tree (role=none)",
      control: "boolean",
    },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-64">
      <p className="text-sm">Seção acima</p>
      <Separator className="my-4" />
      <p className="text-sm">Seção abaixo</p>
    </div>
  ),
};

export const VerticalOrientation: Story = {
  render: () => (
    <div className="flex items-center gap-4 h-8">
      <span className="text-sm">Item A</span>
      <Separator orientation="vertical" />
      <span className="text-sm">Item B</span>
      <Separator orientation="vertical" />
      <span className="text-sm">Item C</span>
    </div>
  ),
};

export const Semantic: Story = {
  render: () => (
    <div className="w-64">
      <p className="text-sm font-bold">Dados pessoais</p>
      <Separator decorative={false} className="my-4" />
      <p className="text-sm font-bold">Dados profissionais</p>
    </div>
  ),
};

export const Interactive: Story = {
  render: () => (
    <div className="w-64">
      <button type="button" className="text-sm underline" data-testid="foco">
        Focar aqui
      </button>
      <p className="text-sm">Antes do separador</p>
      <Separator data-testid="separador" className="my-4" />
      <p className="text-sm">Depois do separador</p>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByTestId("foco");
    const user = userEvent.setup();
    await user.click(button);
    await expect(button).toHaveFocus();

    const sep = canvas.getByTestId("separador");
    await expect(sep).toBeInTheDocument();
    await expect(sep).toHaveAttribute("data-orientation", "horizontal");
  },
};
