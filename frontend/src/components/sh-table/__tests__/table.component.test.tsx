import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/sh-table/table.component";

describe("Table", () => {
  it("renders table structure correctly", () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Header 1</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Cell 1</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    expect(screen.getByText("Header 1")).toBeInTheDocument();
    expect(screen.getByText("Cell 1")).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
  });
});
