import type { Meta, StoryObj } from "@storybook/react-vite";
import { within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../tooltip.component";
import { expect } from "vitest";
import { Button } from "@lib/components/sh-button/button.component";

const meta = {
  title: "UI/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story: React.FC) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Passe o mouse</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Dica útil para o usuário</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const OverText: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="underline decoration-dotted cursor-help">Termo técnico</span>
      </TooltipTrigger>
      <TooltipContent>
        <p>Definição detalhada exibida no tooltip</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const RichContent: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button size="icon" variant="ghost" aria-label="informações">
          ℹ
        </Button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="font-semibold">Informação importante</p>
        <p className="text-xs opacity-80 mt-1">Esta ação não pode ser desfeita após confirmação.</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" data-testid="trigger-tooltip">
          Hover para ver dica
        </Button>
      </TooltipTrigger>
      <TooltipContent>Dica de uso do sistema</TooltipContent>
    </Tooltip>
  ),
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const canvas = within(canvasElement);
    const trigger = canvas.getByTestId("trigger-tooltip");
    await expect(trigger).toBeInTheDocument();
    await user.click(trigger);
    await expect(trigger).toHaveFocus();
    await user.hover(trigger);
  },
};
