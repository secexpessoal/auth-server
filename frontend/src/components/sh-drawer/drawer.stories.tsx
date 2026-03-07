import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@components/sh-button/button.component";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "./drawer.component";

const meta: Meta<typeof Sheet> = {
  title: "Components/Drawer",
  component: Sheet,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Sheet>;

/**
 * Drawer padrão abrindo pela direita (comportamento default do Sheet).
 */
export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Abrir Drawer</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Editar Perfil</SheetTitle>
          <SheetDescription>Faça alterações no seu perfil aqui. Clique em salvar quando terminar.</SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">Conteúdo do drawer vai aqui.</p>
        </div>
        <SheetFooter>
          <Button type="submit">Salvar</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

/**
 * Drawer abrindo pelo lado esquerdo.
 */
export const Left: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Abrir pela Esquerda</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Menu Lateral</SheetTitle>
        </SheetHeader>
        <p className="py-4 text-sm text-muted-foreground">Navegação lateral.</p>
      </SheetContent>
    </Sheet>
  ),
};

/**
 * Drawer abrindo pela parte inferior.
 */
export const Bottom: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Abrir por Baixo</Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Ações</SheetTitle>
        </SheetHeader>
        <p className="py-4 text-sm text-muted-foreground">Drawer inferior para ações contextuais.</p>
      </SheetContent>
    </Sheet>
  ),
};

