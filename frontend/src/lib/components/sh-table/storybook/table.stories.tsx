import type { Meta, StoryObj } from "@storybook/react-vite";
import { within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "../table.component";
import { expect } from "vitest";

const meta = {
  title: "UI/Table",
  component: Table,
  tags: ["autodocs"],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

const rows = [
  { number: "001/2024", requester: "João da Silva", type: "Aposentadoria", status: "Em análise" },
  { number: "002/2024", requester: "Maria Souza", type: "Revisão", status: "Pendente" },
  { number: "003/2024", requester: "Carlos Lima", type: "Aposentadoria", status: "Concluído" },
];

export const Default: Story = {
  render: () => (
    <Table>
      <TableCaption>Lista de rows em análise</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Número</TableHead>
          <TableHead>Requerente</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Situação</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((p) => (
          <TableRow key={p.number}>
            <TableCell className="font-medium">{p.number}</TableCell>
            <TableCell>{p.requester}</TableCell>
            <TableCell>{p.type}</TableCell>
            <TableCell>{p.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead className="text-right">Valor</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Processo 001</TableCell>
          <TableCell className="text-right">R$ 1.200,00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Processo 002</TableCell>
          <TableCell className="text-right">R$ 850,00</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Total</TableCell>
          <TableCell className="text-right">R$ 2.050,00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

export const Interactive: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <button type="button" className="text-sm underline w-fit" data-testid="foco">
        Focar aqui
      </button>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Processo</TableHead>
            <TableHead>Requerente</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>001/2024</TableCell>
            <TableCell>João da Silva</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByTestId("foco");
    const user = userEvent.setup();
    await user.click(button);
    await expect(button).toHaveFocus();
    await expect(canvas.getByRole("table")).toBeInTheDocument();
    await expect(canvas.getByRole("columnheader", { name: "Processo" })).toBeInTheDocument();
    await expect(canvas.getByText("001/2024")).toBeInTheDocument();
  },
};
