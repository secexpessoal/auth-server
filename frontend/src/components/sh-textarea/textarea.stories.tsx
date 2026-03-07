import type { Meta, StoryObj } from "@storybook/react-vite";
import { Textarea } from "./textarea.component";

const meta: Meta<typeof Textarea> = {
  title: "Components/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    placeholder: {
      control: "text",
      description: "Texto de placeholder exibido quando o campo está vazio.",
    },
    disabled: {
      control: "boolean",
      description: "Desabilita o campo de texto.",
    },
    rows: {
      control: "number",
      description: "Número de linhas visíveis (controla a altura inicial).",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

/**
 * Textarea padrão com placeholder.
 */
export const Default: Story = {
  args: {
    placeholder: "Digite uma mensagem...",
    className: "w-80",
  },
};

/**
 * Com conteúdo inicial.
 */
export const WithValue: Story = {
  args: {
    defaultValue: "Esta é uma observação importante que foi preenchida previamente.",
    className: "w-80",
  },
};

/**
 * Estado desabilitado — não aceita interação do usuário.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: "Campo bloqueado",
    className: "w-80",
  },
};

/**
 * Estado inválido — exibe borda de erro.
 */
export const Invalid: Story = {
  args: {
    "aria-invalid": true,
    placeholder: "Campo obrigatório",
    className: "w-80",
  },
};
