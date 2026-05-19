import type { Meta, StoryObj } from "@storybook/react-vite";
import { within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@lib/components/sh-button/button.component";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "../drawer.component";
import { expect } from "vitest";

const meta = {
  title: "UI/Drawer",
  component: Sheet,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    defaultOpen: {
      description: "Abre o drawer por padrão",
      control: "boolean",
    },
  },
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Abrir painel</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Detalhes do processo</SheetTitle>
          <SheetDescription>Informações do requerimento selecionado.</SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">Conteúdo do painel lateral.</p>
        </div>
        <SheetFooter>
          <Button type="submit">Salvar</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const LeftSide: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Abrir pela esquerda</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Menu de navegação</SheetTitle>
        </SheetHeader>
        <p className="py-4 text-sm text-muted-foreground">Navegação lateral do sistema.</p>
      </SheetContent>
    </Sheet>
  ),
};

export const BottomSide: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Abrir por baixo</Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Ações disponíveis</SheetTitle>
        </SheetHeader>
        <p className="py-4 text-sm text-muted-foreground">Drawer inferior para ações contextuais.</p>
      </SheetContent>
    </Sheet>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button data-testid="trigger-drawer">Abrir drawer</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Drawer de teste</SheetTitle>
          <SheetDescription>Conteúdo interativo do drawer.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const canvas = within(canvasElement);
    await user.click(canvas.getByTestId("trigger-drawer"));
    const dialog = within(document.body).getByRole("dialog");
    await expect(dialog).toBeInTheDocument();
    await expect(within(document.body).getByText("Drawer de teste")).toBeInTheDocument();
  },
};
