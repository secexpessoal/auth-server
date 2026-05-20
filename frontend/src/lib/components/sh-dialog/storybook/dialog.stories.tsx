import type { Meta, StoryObj } from "@storybook/react-vite";
import { within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../../sh-button/button.component";
import { Input } from "../../sh-input/input.component";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../dialog.component";
import { expect } from "vitest";

const meta = {
  title: "UI/Dialog",
  component: Dialog,
  tags: ["autodocs"],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Editar processo</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar processo</DialogTitle>
          <DialogDescription>Faça as alterações e clique em Salvar quando terminar.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Número do processo</label>
            <Input placeholder="000/2024" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Salvar alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const SmallSize: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">Confirmar</Button>
      </DialogTrigger>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Confirmar ação</DialogTitle>
          <DialogDescription>Esta ação será registrada no sistema.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button>Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const LargeSize: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Abrir detalhes</Button>
      </DialogTrigger>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Detalhes do processo</DialogTitle>
          <DialogDescription>Informações completas do requerimento.</DialogDescription>
        </DialogHeader>
        <div className="py-4 text-sm text-muted-foreground">Conteúdo detalhado do processo aqui...</div>
      </DialogContent>
    </Dialog>
  ),
};

export const WithoutCloseButton: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Abrir sem ×</Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Sem botão de fechar</DialogTitle>
          <DialogDescription>Use Escape ou clique fora para fechar.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button data-testid="abrir-dialog">Abrir dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog de teste</DialogTitle>
          <DialogDescription>Conteúdo do dialog interativo.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancelar</Button>
          <Button>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const canvas = within(canvasElement);
    const trigger = canvas.getByTestId("abrir-dialog");
    await user.click(trigger);
    await expect(within(document.body).getByRole("dialog")).toBeInTheDocument();
    await expect(within(document.body).getByText("Dialog de teste")).toBeInTheDocument();
    const closeButton = document.querySelector("[data-slot='dialog-close']");
    await expect(closeButton).toBeTruthy();
  },
};
