import type { Meta, StoryObj } from "@storybook/react-vite";
import { within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Label } from "@lib/components/sh-label/label.component";
import { RadioGroup, RadioGroupItem } from "../radio-check.component";
import { expect } from "vitest";

const meta = {
  title: "UI/RadioCheck",
  component: RadioGroup,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      description: "Orientação dos itens do grupo",
      control: "select",
      options: ["vertical", "horizontal"],
    },
    disabled: {
      description: "Desabilita todos os itens do grupo",
      control: "boolean",
    },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="op1">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="op1" id="op1" />
        <Label htmlFor="op1">Opção 1</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="op2" id="op2" />
        <Label htmlFor="op2">Opção 2</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="op3" id="op3" />
        <Label htmlFor="op3">Opção 3</Label>
      </div>
    </RadioGroup>
  ),
};

export const HorizontalVariant: Story = {
  render: () => (
    <RadioGroup defaultValue="sim" variant="horizontal">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="sim" id="sim" />
        <Label htmlFor="sim">Sim</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="nao" id="nao" />
        <Label htmlFor="nao">Não</Label>
      </div>
    </RadioGroup>
  ),
};

export const DisabledItem: Story = {
  render: () => (
    <RadioGroup defaultValue="a">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="a" id="a" />
        <Label htmlFor="a">Disponível</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="b" id="b" disabled />
        <Label htmlFor="b" className="opacity-50 cursor-not-allowed">
          Indisponível
        </Label>
      </div>
    </RadioGroup>
  ),
};

export const DisabledState: Story = {
  render: () => (
    <RadioGroup defaultValue="a" disabled>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="a" id="a2" />
        <Label htmlFor="a2" className="opacity-50">
          Opção A
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="b" id="b2" />
        <Label htmlFor="b2" className="opacity-50">
          Opção B
        </Label>
      </div>
    </RadioGroup>
  ),
};

export const Interactive: Story = {
  render: () => (
    <RadioGroup defaultValue="sim" variant="horizontal">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="sim" id="sim3" />
        <Label htmlFor="sim3">Sim</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="nao" id="nao3" />
        <Label htmlFor="nao3">Não</Label>
      </div>
    </RadioGroup>
  ),
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const canvas = within(canvasElement);
    const radioYes = canvas.getByRole("radio", { name: "Sim" });
    await user.click(radioYes);
    await expect(radioYes).toHaveFocus();
  },
};
