import type { Meta, StoryObj } from "@storybook/react-vite";
import { within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchIcon } from "lucide-react";
import { Button } from "@lib/components/sh-button/button.component";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "../button-group.component";
import { expect } from "vitest";

const meta = {
  title: "UI/ButtonGroup",
  component: ButtonGroup,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    orientation: {
      description: "Orientação do grupo",
      control: "select",
      options: ["horizontal", "vertical"],
    },
    className: {
      description: "Classes CSS adicionais",
      control: "text",
    },
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

export const Default: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Anterior</Button>
      <ButtonGroupSeparator />
      <Button variant="outline">1</Button>
      <Button variant="outline">2</Button>
      <Button variant="outline">3</Button>
      <ButtonGroupSeparator />
      <Button variant="outline">Próximo</Button>
    </ButtonGroup>
  ),
};

export const WithText: Story = {
  render: () => (
    <ButtonGroup>
      <ButtonGroupText>
        <SearchIcon />
        Buscar
      </ButtonGroupText>
      <ButtonGroupSeparator />
      <Button variant="ghost">Buscar</Button>
    </ButtonGroup>
  ),
};

export const VerticalOrientation: Story = {
  render: () => (
    <ButtonGroup orientation="vertical">
      <Button variant="outline">Opção A</Button>
      <ButtonGroupSeparator orientation="horizontal" />
      <Button variant="outline">Opção B</Button>
      <ButtonGroupSeparator orientation="horizontal" />
      <Button variant="outline">Opção C</Button>
    </ButtonGroup>
  ),
};

export const Interactive: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Confirmar</Button>
      <ButtonGroupSeparator />
      <Button variant="outline">Cancelar</Button>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Confirmar" });
    await user.click(button);
    await expect(button).toHaveFocus();
  },
};
