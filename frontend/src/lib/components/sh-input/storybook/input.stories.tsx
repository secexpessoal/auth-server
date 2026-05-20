import type { Meta, StoryObj } from "@storybook/react-vite";
import { within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "../input.component";
import { expect } from "vitest";

const meta = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      description: "Variante visual do campo",
      control: "select",
      options: ["default", "glass"],
    },
    size: {
      description: "Tamanho do campo",
      control: "select",
      options: ["default", "sm"],
    },
    type: {
      description: "Tipo HTML do input",
      control: "select",
      options: ["text", "email", "password", "number", "tel", "search", "url"],
    },
    placeholder: {
      description: "Texto de placeholder",
      control: "text",
    },
    disabled: {
      description: "Desabilita o campo",
      control: "boolean",
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Digite aqui...",
  },
};

export const GlassVariant: Story = {
  args: {
    variant: "glass",
    placeholder: "Variante glass",
  },
  parameters: {
    backgrounds: { default: "dark" },
  },
};

export const SmallSize: Story = {
  args: {
    size: "sm",
    placeholder: "Campo compacto",
  },
};

export const PasswordType: Story = {
  args: {
    type: "password",
    placeholder: "Senha",
  },
};

export const EmailType: Story = {
  args: {
    type: "email",
    placeholder: "exemplo@email.com.br",
  },
};

export const DisabledState: Story = {
  args: {
    disabled: true,
    placeholder: "Campo indisponível",
  },
};

export const WithError: Story = {
  args: {
    "aria-invalid": true,
    placeholder: "Campo com erro",
    defaultValue: "valor inválido",
  },
};

export const Interactive: Story = {
  args: {
    placeholder: "Digite seu nome",
  },
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");
    await user.click(input);
    await expect(input).toHaveFocus();
    await user.type(input, "João Silva");
    await expect(input).toHaveValue("João Silva");
  },
};
