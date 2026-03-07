import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@components/sh-button/button.component";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip.component";

const meta: Meta<typeof Tooltip> = {
  title: "Components/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

/**
 * Tooltip padrão exibido ao fazer hover sobre um botão.
 */
export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Passe o mouse</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Esta é uma dica útil para o usuário.</p>
      </TooltipContent>
    </Tooltip>
  ),
};

/**
 * Tooltip sobre um elemento de texto simples.
 */
export const OnText: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="underline decoration-dotted cursor-help">Termo técnico</span>
      </TooltipTrigger>
      <TooltipContent>
        <p>Definição detalhada do termo exibida no tooltip.</p>
      </TooltipContent>
    </Tooltip>
  ),
};

/**
 * Tooltip com conteúdo rico (múltiplas linhas).
 */
export const RichContent: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button size="icon" variant="ghost">
          ℹ️
        </Button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="font-semibold">Informação importante</p>
        <p className="text-xs opacity-80 mt-1">Esta ação não pode ser desfeita após confirmação.</p>
      </TooltipContent>
    </Tooltip>
  ),
};

