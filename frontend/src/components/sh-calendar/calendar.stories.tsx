import type { Meta, StoryObj } from "@storybook/react-vite";
import { Calendar } from "./calendar.component";

const meta: Meta<typeof Calendar> = {
  title: "Components/Calendar",
  component: Calendar,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Calendar>;

export const Default: Story = {
  args: {
    mode: "single",
    selected: new Date(),
    className: "rounded-md border shadow-sm",
  },
};

export const Range: Story = {
  args: {
    mode: "range",
    selected: {
      from: new Date(),
      to: new Date(new Date().setDate(new Date().getDate() + 7)),
    },
    className: "rounded-md border shadow-sm",
  },
};
