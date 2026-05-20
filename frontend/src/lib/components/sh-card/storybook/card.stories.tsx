import type { Meta, StoryObj } from "@storybook/react-vite";
import { within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../../sh-button/button.component";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../card.component";
import { expect } from "vitest";

const meta = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
  argTypes: {
    className: {
      description: "Classes CSS adicionais",
      control: "text",
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Card {...args} className="w-[350px]">
      <CardHeader>
        <CardTitle>Processo 001/2024</CardTitle>
        <CardDescription>Aposentadoria por tempo de contribuição</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Requerente: João da Silva — CPF: 000.000.000-00</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Analisar</Button>
      </CardFooter>
    </Card>
  ),
};

export const WithHeaderAction: Story = {
  render: (args) => (
    <Card {...args} className="w-[350px]">
      <CardHeader>
        <CardTitle>Notificações</CardTitle>
        <CardDescription>Você tem 3 mensagens não lidas.</CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon" aria-label="Fechar notificações">
            ✕
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-sm">Nova mensagem de Maria Souza</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          Marcar todas como lidas
        </Button>
      </CardFooter>
    </Card>
  ),
};

export const ContentOnly: Story = {
  render: (args) => (
    <Card {...args} className="w-[350px]">
      <CardContent className="pt-6">
        <p className="text-sm">Card sem cabeçalho — apenas conteúdo central.</p>
      </CardContent>
    </Card>
  ),
};

export const Interactive: Story = {
  render: (args) => (
    <Card {...args} className="w-[350px]" data-testid="card-interactive">
      <CardHeader>
        <CardTitle>Título do Card</CardTitle>
        <CardDescription>Subtítulo descritivo</CardDescription>
      </CardHeader>
      <CardContent>Conteúdo principal</CardContent>
      <CardFooter>
        <Button data-testid="btn-card">Ação</Button>
      </CardFooter>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId("card-interactive")).toBeInTheDocument();
    await expect(canvas.getByText("Título do Card")).toBeInTheDocument();

    const button = canvas.getByRole("button", { name: "Ação" });

    await user.click(button);
    await expect(button).toHaveFocus();
  },
};
