import type { Meta, StoryObj } from "@storybook/react-vite";
import { within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../select.component";
import { expect } from "vitest";

const meta = {
  title: "UI/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Selecione o tipo" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Tipos de processo</SelectLabel>
          <SelectItem value="aposentadoria">Aposentadoria</SelectItem>
          <SelectItem value="revisao">Revisão de benefício</SelectItem>
          <SelectItem value="pensao">Pensão por morte</SelectItem>
          <SelectItem value="auxilio">Auxílio-doença</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

export const WithGroups: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[240px]">
        <SelectValue placeholder="Selecione a categoria" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Aposentadoria</SelectLabel>
          <SelectItem value="tempo">Por tempo de contribuição</SelectItem>
          <SelectItem value="idade">Por idade</SelectItem>
          <SelectItem value="invalidez">Por invalidez</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Benefícios</SelectLabel>
          <SelectItem value="pensao">Pensão por morte</SelectItem>
          <SelectItem value="auxilio">Auxílio-doença</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

export const DisabledState: Story = {
  render: () => (
    <Select disabled>
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Campo bloqueado" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="a">Opção A</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const WithDisabledItem: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Selecione" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ativo">Ativo</SelectItem>
        <SelectItem value="inativo" disabled>
          Inativo (bloqueado)
        </SelectItem>
        <SelectItem value="pendente">Pendente</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[220px]" data-testid="select-trigger">
        <SelectValue placeholder="Selecione o tipo" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="aposentadoria">Aposentadoria</SelectItem>
        <SelectItem value="revisao">Revisão</SelectItem>
      </SelectContent>
    </Select>
  ),
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const canvas = within(canvasElement);
    const trigger = canvas.getByTestId("select-trigger");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  },
};
