import type { Meta, StoryObj } from "@storybook/react-vite";
import { SearchIcon } from "lucide-react";
import { Button } from "@components/sh-button/button.component";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "./button-group.component";

const meta: Meta<typeof ButtonGroup> = {
  title: "Components/ButtonGroup",
  component: ButtonGroup,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
      description: "Orientação do grupo de botões.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

/**
 * Grupo horizontal de botões com separador.
 */
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

/**
 * Grupo com texto auxiliar (addon) e botão de ação.
 */
export const WithText: Story = {
  render: () => (
    <ButtonGroup>
      <ButtonGroupText>
        <SearchIcon />
      </ButtonGroupText>
      <ButtonGroupSeparator />
      <Button variant="ghost">Buscar</Button>
    </ButtonGroup>
  ),
};

/**
 * Grupo com orientação vertical.
 */
export const Vertical: Story = {
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

