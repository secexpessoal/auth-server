import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "../table.component";

describe("Table", () => {
  describe("renderização", () => {
    it("deve renderizar a estrutura completa da tabela", () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Cargo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>João da Silva</TableCell>
              <TableCell>Analista</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      );
      expect(screen.getByRole("table")).toBeInTheDocument();
      expect(screen.getByText("Nome")).toBeInTheDocument();
      expect(screen.getByText("João da Silva")).toBeInTheDocument();
    });

    it("deve renderizar TableCaption", () => {
      render(
        <Table>
          <TableCaption>Lista de processos</TableCaption>
          <TableBody>
            <TableRow>
              <TableCell>Dado</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      );
      expect(screen.getByText("Lista de processos")).toBeInTheDocument();
    });

    it("deve renderizar TableFooter com dados de rodapé", () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Item</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>Total: 1</TableCell>
            </TableRow>
          </TableFooter>
        </Table>,
      );
      expect(screen.getByText("Total: 1")).toBeInTheDocument();
    });
  });

  describe("estados", () => {
    it("deve aplicar className customizado na tabela", () => {
      render(
        <Table className="tabela-customizada">
          <TableBody>
            <TableRow>
              <TableCell>x</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      );
      expect(screen.getByRole("table")).toHaveClass("tabela-customizada");
    });

    it("deve ter data-slot correto nas células", () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell data-testid="celula">Conteúdo</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      );
      expect(screen.getByTestId("celula")).toHaveAttribute("data-slot", "table-cell");
    });
  });

  describe("interação", () => {
    it("deve renderizar múltiplas linhas de dados", () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Linha 1</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Linha 2</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Linha 3</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      );
      expect(screen.getAllByRole("row")).toHaveLength(3);
    });
  });

  describe("acessibilidade", () => {
    it("deve ter role=table", () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Dado</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      );
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    it("deve ter role=columnheader nas células de cabeçalho", () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Processo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>001/2024</TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      );
      expect(screen.getByRole("columnheader", { name: "Processo" })).toBeInTheDocument();
    });
  });
});
