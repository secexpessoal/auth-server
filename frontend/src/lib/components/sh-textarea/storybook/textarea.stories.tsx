import type { Meta, StoryObj } from "@storybook/react-vite";
import { within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Textarea } from "../textarea.component";
import { expect } from "vitest";

const meta = {
  title: "UI/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  argTypes: {
    placeholder: {
      description: "Texto de placeholder",
      control: "text",
    },
    disabled: {
      description: "Desabilita o campo",
      control: "boolean",
    },
    rows: {
      description: "Número mínimo de linhas visíveis",
      control: "number",
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Descreva o motivo da solicitação...",
    className: "w-80",
  },
};

export const WithContent: Story = {
  args: {
    defaultValue: "O requerente solicita aposentadoria por tempo de contribuição, tendo completado 35 anos de serviço público efetivo.",
    className: "w-80",
  },
};

export const DisabledState: Story = {
  args: {
    disabled: true,
    placeholder: "Campo indisponível para edição",
    className: "w-80",
  },
};

export const WithError: Story = {
  args: {
    "aria-invalid": true,
    placeholder: "Campo obrigatório",
    className: "w-80",
  },
};

export const Interactive: Story = {
  args: {
    placeholder: "Digite sua mensagem",
    className: "w-80",
  },
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox");
    await user.click(textarea);
    await expect(textarea).toHaveFocus();
    await user.type(textarea, "Texto de exemplo digitado pelo usuário");
    await expect(textarea).toHaveValue("Texto de exemplo digitado pelo usuário");
  },
};
