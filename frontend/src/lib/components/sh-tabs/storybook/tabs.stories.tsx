import type { Meta, StoryObj } from "@storybook/react-vite";
import { within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs.component";
import { expect } from "vitest";

const meta = {
  title: "UI/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    orientation: {
      description: "Orientação das abas",
      control: "select",
      options: ["horizontal", "vertical"],
    },
    defaultValue: {
      description: "Valor da aba ativa por padrão",
      control: "text",
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="dados" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="dados">Dados Pessoais</TabsTrigger>
        <TabsTrigger value="documentos">Documentos</TabsTrigger>
        <TabsTrigger value="historico">Histórico</TabsTrigger>
      </TabsList>
      <TabsContent value="dados">
        <p className="text-sm p-4">Informações pessoais do requerente.</p>
      </TabsContent>
      <TabsContent value="documentos">
        <p className="text-sm p-4">Documentos anexados ao processo.</p>
      </TabsContent>
      <TabsContent value="historico">
        <p className="text-sm p-4">Histórico de movimentações.</p>
      </TabsContent>
    </Tabs>
  ),
};

export const LineVariant: Story = {
  render: () => (
    <Tabs defaultValue="dados" className="w-[400px]">
      <TabsList variant="line">
        <TabsTrigger value="dados">Dados Pessoais</TabsTrigger>
        <TabsTrigger value="documentos">Documentos</TabsTrigger>
      </TabsList>
      <TabsContent value="dados">
        <p className="text-sm p-4">Informações pessoais.</p>
      </TabsContent>
      <TabsContent value="documentos">
        <p className="text-sm p-4">Documentos do processo.</p>
      </TabsContent>
    </Tabs>
  ),
};

export const VerticalOrientation: Story = {
  render: () => (
    <Tabs defaultValue="dados" orientation="vertical" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="dados">Dados</TabsTrigger>
        <TabsTrigger value="documentos">Documentos</TabsTrigger>
      </TabsList>
      <TabsContent value="dados">
        <p className="text-sm p-4">Dados pessoais.</p>
      </TabsContent>
      <TabsContent value="documentos">
        <p className="text-sm p-4">Documentos.</p>
      </TabsContent>
    </Tabs>
  ),
};

export const WithDisabledTab: Story = {
  render: () => (
    <Tabs defaultValue="dados" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="dados">Dados</TabsTrigger>
        <TabsTrigger value="bloqueado" disabled>
          Bloqueado
        </TabsTrigger>
      </TabsList>
      <TabsContent value="dados">Conteúdo ativo.</TabsContent>
    </Tabs>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Tabs defaultValue="aba1" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="aba1">Aba 1</TabsTrigger>
        <TabsTrigger value="tab2">Aba 2</TabsTrigger>
      </TabsList>
      <TabsContent value="aba1">Conteúdo da aba 1</TabsContent>
      <TabsContent value="tab2">Conteúdo da aba 2</TabsContent>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Conteúdo da aba 1")).toBeInTheDocument();
    const tab2 = canvas.getByRole("tab", { name: "Aba 2" });
    await user.click(tab2);
    await expect(tab2).toHaveFocus();
    await expect(canvas.getByText("Conteúdo da aba 2")).toBeInTheDocument();
  },
};
