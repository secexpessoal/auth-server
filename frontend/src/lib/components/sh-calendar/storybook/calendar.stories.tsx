import type { Meta, StoryObj } from "@storybook/react-vite";
import { within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ptBR } from "date-fns/locale";
import { Calendar } from "../calendar.component";
import { expect } from "vitest";

const meta = {
  title: "UI/Calendar",
  component: Calendar,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    mode: {
      description: "Modo de seleção (single/range)",
      control: "select",
      options: ["single", "range"],
    },
    showOutsideDays: {
      description: "Exibe dias fora do mês corrente",
      control: "boolean",
    },
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof Calendar>;

export const Default: Story = {
  args: {
    mode: "single",
    selected: new Date("2024-06-15"),
    className: "rounded-md border shadow-sm",
    locale: ptBR,
  },
};

export const RangeMode: Story = {
  args: {
    mode: "range",
    selected: {
      from: new Date("2024-06-10"),
      to: new Date("2024-06-17"),
    },
    className: "rounded-md border shadow-sm",
    locale: ptBR,
  },
};

export const Interactive: Story = {
  args: {
    mode: "single",
    className: "rounded-md border shadow-sm",
    locale: ptBR,
  },
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("grid")).toBeInTheDocument();

    const firstDay = canvasElement.querySelector<HTMLButtonElement>("button[data-day]:not([disabled])");
    if (!firstDay) throw new Error("Não foi possível encontrar um dia selecionável.");

    await user.click(firstDay);
    await expect(firstDay).toHaveFocus();
  },
};
