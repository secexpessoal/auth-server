import type { Meta, StoryObj } from "@storybook/react-vite";
import { within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EyeIcon, SearchIcon } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea } from "../input-group.component";
import { expect } from "vitest";

const meta = {
  title: "UI/InputGroup",
  component: InputGroup,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    className: { description: "Classes CSS adicionais", control: "text" },
  },
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <InputGroup className="w-72">
      <InputGroupAddon>
        <InputGroupText>@</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput placeholder="usuário" />
    </InputGroup>
  ),
};

export const WithIconAndButton: Story = {
  render: () => (
    <InputGroup className="w-80">
      <InputGroupAddon>
        <InputGroupText>
          <SearchIcon />
        </InputGroupText>
      </InputGroupAddon>
      <InputGroupInput placeholder="Buscar..." />
      <InputGroupAddon align="inline-end">
        <InputGroupButton>Buscar</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
};

export const WithSuffix: Story = {
  render: () => (
    <InputGroup className="w-72">
      <InputGroupInput type="password" placeholder="Senha" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton aria-label="Mostrar senha">
          <EyeIcon />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
};

export const WithTextarea: Story = {
  render: () => (
    <InputGroup className="w-80">
      <InputGroupAddon>
        <InputGroupText>Obs.</InputGroupText>
      </InputGroupAddon>
      <InputGroupTextarea placeholder="Digite uma observação..." />
    </InputGroup>
  ),
};

export const DisabledState: Story = {
  render: () => (
    <InputGroup className="w-72">
      <InputGroupAddon>
        <InputGroupText>€</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput disabled placeholder="Valor bloqueado" />
    </InputGroup>
  ),
};

export const Interactive: Story = {
  render: () => (
    <InputGroup className="w-80">
      <InputGroupAddon>
        <InputGroupText>
          <SearchIcon />
        </InputGroupText>
      </InputGroupAddon>
      <InputGroupInput placeholder="Buscar..." />
      <InputGroupAddon align="inline-end">
        <InputGroupButton>Buscar</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("Buscar...");
    await user.click(input);
    await expect(input).toHaveFocus();
  },
};
