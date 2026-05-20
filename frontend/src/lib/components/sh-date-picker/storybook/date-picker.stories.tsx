import type { Meta, StoryObj } from "@storybook/react-vite";
import { within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DatePicker } from "../date-picker.component";
import { expect } from "vitest";

const meta = {
  title: "UI/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    placeholder: {
      description: "Texto exibido quando nenhuma data está selecionada",
      control: "text",
    },
    disabled: {
      description: "Desabilita o seletor",
      control: "boolean",
    },
    value: {
      description: "Data selecionada no formato YYYY-MM-DD",
      control: "text",
    },
    min: {
      description: "Data mínima permitida (YYYY-MM-DD)",
      control: "text",
    },
    max: {
      description: "Data máxima permitida (YYYY-MM-DD)",
      control: "text",
    },
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {
  args: {
    placeholder: "Selecione uma data",
  },
};

export const CustomPlaceholder: Story = {
  args: {
    placeholder: "Escolha o prazo",
  },
};

export const WithValue: Story = {
  args: {
    value: "2024-06-15",
  },
};

export const DisabledState: Story = {
  args: {
    disabled: true,
    placeholder: "Campo bloqueado",
  },
};

export const Interactive: Story = {
  args: {
    placeholder: "Selecione uma data",
  },
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button");
    await user.click(trigger);
    await expect(within(document.body).getByRole("grid")).toBeInTheDocument();
  },
};
