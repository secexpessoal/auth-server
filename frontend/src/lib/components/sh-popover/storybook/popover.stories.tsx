import type { Meta, StoryObj } from "@storybook/react-vite";
import { within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@lib/components/sh-button/button.component";
import { Popover, PopoverContent, PopoverTrigger } from "../popover.component";
import { expect } from "vitest";

const meta = {
  title: "UI/Popover",
  component: Popover,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Abrir opções</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Configurações</h4>
          <p className="text-sm text-muted-foreground">Ajuste as dimensões do componente.</p>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button>Filtros</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Filtrar por período</h4>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-muted-foreground">Data de início</label>
            <input type="date" className="border rounded px-2 py-1 text-sm" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-muted-foreground">Data de fim</label>
            <input type="date" className="border rounded px-2 py-1 text-sm" />
          </div>
          <Button size="sm" className="w-full">
            Aplicar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" data-testid="trigger-popover">
          Clique para abrir
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <p className="text-sm">Conteúdo do popover visível</p>
      </PopoverContent>
    </Popover>
  ),
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const canvas = within(canvasElement);
    const trigger = canvas.getByTestId("trigger-popover");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  },
};
