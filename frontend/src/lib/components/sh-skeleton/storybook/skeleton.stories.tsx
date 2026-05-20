import type { Meta, StoryObj } from "@storybook/react-vite";
import { within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Skeleton } from "../skeleton.component";
import { expect } from "vitest";

const meta = {
  title: "UI/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    className: {
      description: "Classes CSS para controlar largura, altura e forma",
      control: "text",
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: "h-4 w-64",
  },
};

export const Avatar: Story = {
  args: {
    className: "h-12 w-12 rounded-full",
  },
};

export const Card: Story = {
  render: () => (
    <div className="flex items-center space-x-4 p-4 w-80">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  ),
};

export const Thumbnail: Story = {
  args: {
    className: "h-32 w-64 rounded-lg",
  },
};

export const Interactive: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <button type="button" className="text-sm underline w-fit" data-testid="foco">
        Focar aqui
      </button>
      <Skeleton className="h-8 w-48" data-testid="skeleton-interativo" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByTestId("foco");
    const user = userEvent.setup();
    await user.click(button);
    await expect(button).toHaveFocus();
    const sk = canvas.getByTestId("skeleton-interativo");
    await expect(sk).toBeInTheDocument();
    await expect(sk).toHaveAttribute("data-slot", "skeleton");
  },
};
