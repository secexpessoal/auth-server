import type { Meta, StoryObj } from "@storybook/react-vite";
import { within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../button.component";
import { expect } from "vitest";

const meta = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      description: "Variante visual do botão",
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link", "success", "input"],
    },
    size: {
      description: "Tamanho do botão",
      control: "select",
      options: ["default", "xs", "sm", "lg", "icon", "h12", "icon-xs", "icon-sm", "icon-lg"],
    },
    disabled: {
      description: "Desabilita o botão e impede interações",
      control: "boolean",
    },
    children: {
      description: "Conteúdo do botão (texto, ícone ou ambos)",
      control: "text",
    },
    asChild: {
      description: "Renderiza como filho via Slot — útil para compor com links",
      control: "boolean",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Salvar",
  },
};

export const DestructiveVariant: Story = {
  args: {
    variant: "destructive",
    children: "Excluir registro",
  },
};

export const OutlineVariant: Story = {
  args: {
    variant: "outline",
    children: "Cancelar",
  },
};

export const SecondaryVariant: Story = {
  args: {
    variant: "secondary",
    children: "Secundário",
  },
};

export const GhostVariant: Story = {
  args: {
    variant: "ghost",
    children: "Ação sutil",
  },
};

export const LinkVariant: Story = {
  args: {
    variant: "link",
    children: "Abrir detalhes",
  },
};

export const SuccessVariant: Story = {
  args: {
    variant: "success",
    children: "Confirmado",
  },
};

export const InputVariant: Story = {
  args: {
    variant: "input",
    children: "Adicionar",
  },
};

export const SmallSize: Story = {
  args: {
    size: "sm",
    children: "Compacto",
  },
};

export const LargeSize: Story = {
  args: {
    size: "lg",
    children: "Destaque",
  },
};

export const DisabledState: Story = {
  args: {
    disabled: true,
    children: "Indisponível",
  },
};

export const Interactive: Story = {
  args: {
    children: "Clique aqui",
  },
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const canvas = within(canvasElement);
    const btn = canvas.getByRole("button", { name: /clique aqui/i });
    await expect(btn).toBeInTheDocument();
    await expect(btn).not.toBeDisabled();
    await user.click(btn);
    await expect(btn).toHaveFocus();
  },
};
