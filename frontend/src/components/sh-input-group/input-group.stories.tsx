import type { Meta, StoryObj } from "@storybook/react-vite";
import { SearchIcon, EyeIcon } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea } from "./input-group.component";

const meta: Meta<typeof InputGroup> = {
  title: "Components/InputGroup",
  component: InputGroup,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof InputGroup>;

/**
 * Input com prefixo de texto (addon à esquerda).
 */
export const WithPrefix: Story = {
  render: () => (
    <InputGroup className="w-72">
      <InputGroupAddon>
        <InputGroupText>@</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput placeholder="usuário" />
    </InputGroup>
  ),
};

/**
 * Input com ícone de busca à esquerda e botão à direita.
 */
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

/**
 * Input com sufixo de ícone (addon à direita).
 */
export const WithSuffix: Story = {
  render: () => (
    <InputGroup className="w-72">
      <InputGroupInput type="password" placeholder="Senha" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton>
          <EyeIcon />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
};

/**
 * Textarea dentro do InputGroup para campos multilinhas.
 */
export const TextareaGroup: Story = {
  render: () => (
    <InputGroup className="w-80">
      <InputGroupAddon>
        <InputGroupText>📝</InputGroupText>
      </InputGroupAddon>
      <InputGroupTextarea placeholder="Digite uma observação..." />
    </InputGroup>
  ),
};

/**
 * InputGroup desabilitado.
 */
export const Disabled: Story = {
  render: () => (
    <InputGroup className="w-72">
      <InputGroupAddon>
        <InputGroupText>€</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput disabled placeholder="Valor bloqueado" />
    </InputGroup>
  ),
};
