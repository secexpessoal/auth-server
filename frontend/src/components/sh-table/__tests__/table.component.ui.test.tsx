import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@components/sh-table/table.component";

describe("Table", () => {
  it("renderiza a estrutura completa da tabela", () => {
    // Arrange & Act
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
            <TableCell>João</TableCell>
            <TableCell>Analista</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    // Assert
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("Nome")).toBeInTheDocument();
    expect(screen.getByText("João")).toBeInTheDocument();
  });

  it("renderiza TableCaption corretamente", () => {
    // Arrange & Act
    render(
      <Table>
        <TableCaption>Legenda da tabela</TableCaption>
        <TableBody>
          <TableRow>
            <TableCell>Dado</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    // Assert
    expect(screen.getByText("Legenda da tabela")).toBeInTheDocument();
  });

  it("aplica className customizado na tabela", () => {
    // Arrange & Act
    render(
      <Table className="tabela-customizada">
        <TableBody>
          <TableRow>
            <TableCell>x</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    // Assert
    expect(screen.getByRole("table")).toHaveClass("tabela-customizada");
  });
});
