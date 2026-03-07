import type { Meta, StoryObj } from "@storybook/react-vite";
import { Label } from "@components/sh-label/label.component";
import { RadioGroup, RadioGroupItem } from "./radio-check.component";

const meta: Meta<typeof RadioGroup> = {
  title: "Components/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["vertical", "horizontal"],
      description: "Orientação dos itens do grupo.",
    },
    disabled: {
      control: "boolean",
      description: "Desabilita todos os itens do grupo.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

/**
 * Grupo de rádio vertical (padrão) com labels.
 */
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

/**
 * Grupo de rádio horizontal.
 */
export const Horizontal: Story = {
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

/**
 * Item desabilitado dentro do grupo.
 */
export const WithDisabledItem: Story = {
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

