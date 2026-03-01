import type { Meta, StoryObj } from "@storybook/react-vite";
import { Spinner } from "./spinner.component";

const meta: Meta<typeof Spinner> = {
  title: "Components/Spinner",
  component: Spinner,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = {};

export const CustomSizeAndColor: Story = {
  args: {
    className: "size-8 text-primary",
  },
};
