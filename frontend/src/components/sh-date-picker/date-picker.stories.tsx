import type { Meta, StoryObj } from "@storybook/react-vite";
import { DatePicker } from "./date-picker.component";

const meta: Meta<typeof DatePicker> = {
  title: "Components/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    placeholder: {
      control: "text",
      description: "Texto exibido quando nenhuma data está selecionada.",
    },
    disabled: {
      control: "boolean",
      description: "Desabilita o seletor de data.",
    },
    value: {
      control: "text",
      description: "Data selecionada no formato ISO 8601 (YYYY-MM-DD).",
    },
  },
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

/**
 * Estado inicial sem data selecionada.
 */
export const Default: Story = {
  args: {
    placeholder: "Selecione uma data",
  },
};

/**
 * Com placeholder customizado.
 */
export const CustomPlaceholder: Story = {
  args: {
    placeholder: "Escolha o prazo",
  },
};

/**
 * Com data pré-selecionada.
 */
export const WithValue: Story = {
  args: {
    value: "2024-06-15",
  },
};

/**
 * Estado desabilitado — o seletor não pode ser aberto.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: "Campo bloqueado",
  },
};
