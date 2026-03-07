import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "@components/sh-input/input.component";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel, FieldSet } from "./field.component";

const meta: Meta<typeof Field> = {
  title: "Components/Field",
  component: Field,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    orientation: {
      control: "select",
      options: ["vertical", "horizontal"],
      description: "Orientação do campo: vertical (padrão) ou horizontal (label ao lado).",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Field>;

/**
 * Campo simples vertical com label e input.
 */
export const Default: Story = {
  render: () => (
    <Field className="w-80">
      <FieldLabel htmlFor="nome">Nome completo</FieldLabel>
      <FieldContent>
        <Input id="nome" placeholder="Digite seu nome" />
      </FieldContent>
      <FieldDescription>Informe o nome como aparece no documento.</FieldDescription>
    </Field>
  ),
};

/**
 * Campo com mensagem de erro visível.
 */
export const WithError: Story = {
  render: () => (
    <Field className="w-80">
      <FieldLabel htmlFor="email">E-mail</FieldLabel>
      <FieldContent>
        <Input id="email" placeholder="email@exemplo.com" aria-invalid="true" />
      </FieldContent>
      <FieldError errors={[{ message: "E-mail é obrigatório" }]} />
    </Field>
  ),
};

/**
 * Campo com orientação horizontal (label ao lado do input).
 */
export const Horizontal: Story = {
  render: () => (
    <FieldSet className="w-96">
      <Field orientation="horizontal">
        <FieldLabel htmlFor="cargo">Cargo</FieldLabel>
        <FieldContent>
          <Input id="cargo" placeholder="Ex: Analista" />
        </FieldContent>
      </Field>
    </FieldSet>
  ),
};

