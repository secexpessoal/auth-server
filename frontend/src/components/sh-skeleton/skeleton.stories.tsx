import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton } from "./skeleton.component";

const meta: Meta<typeof Skeleton> = {
  title: "Components/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    className: {
      control: "text",
      description: "Classes CSS adicionais para controlar largura, altura e forma.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

/**
 * Skeleton de linha de texto simples.
 */
export const Line: Story = {
  args: {
    className: "h-4 w-64",
  },
};

/**
 * Skeleton de avatar circular.
 */
export const Avatar: Story = {
  args: {
    className: "h-12 w-12 rounded-full",
  },
};

/**
 * Skeleton de card completo simulando um item de lista.
 */
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

/**
 * Skeleton de bloco retangular para imagens ou thumbnails.
 */
export const Thumbnail: Story = {
  args: {
    className: "h-32 w-64 rounded-lg",
  },
};
