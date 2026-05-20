import type { Meta, StoryObj } from "@storybook/react-vite";
import { within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Spinner } from "../spinner.component";
import { expect } from "vitest";

const meta = {
  title: "UI/Spinner",
  component: Spinner,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    className: {
      description: "Classes CSS adicionais para tamanho e cor (ex: `size-8 text-primary`)",
      control: "text",
    },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LargeSize: Story = {
  args: {
    className: "size-8",
  },
};

export const PrimaryColor: Story = {
  args: {
    className: "size-6 text-primary",
  },
};

export const DestructiveColor: Story = {
  args: {
    className: "size-6 text-destructive",
  },
};

export const Interactive: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <button type="button" className="text-sm underline w-fit" data-testid="foco">
        Focar aqui
      </button>
      <Spinner />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByTestId("foco");
    const user = userEvent.setup();
    await user.click(button);
    await expect(button).toHaveFocus();
    const spinner = canvas.getByRole("status");
    await expect(spinner).toBeInTheDocument();
    await expect(spinner).toHaveAttribute("aria-label", "Loading");
  },
};
