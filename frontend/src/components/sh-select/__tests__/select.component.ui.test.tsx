import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/sh-select/select.component";

describe("Select", () => {
  it("renderiza o trigger com placeholder", () => {
    // Arrange & Act
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Selecione" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Opção A</SelectItem>
        </SelectContent>
      </Select>,
    );

    // Assert
    expect(screen.getByText("Selecione")).toBeInTheDocument();
  });

  it("abre as opções ao clicar no trigger", async () => {
    // Arrange
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Escolha" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="op1">Opção 1</SelectItem>
          <SelectItem value="op2">Opção 2</SelectItem>
        </SelectContent>
      </Select>,
    );

    // Act
    await userEvent.click(screen.getByRole("combobox"));

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Opção 1")).toBeInTheDocument();
      expect(screen.getByText("Opção 2")).toBeInTheDocument();
    });
  });

  it("está desabilitado quando a prop disabled é passada", () => {
    // Arrange & Act
    render(
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Desabilitado" />
        </SelectTrigger>
      </Select>,
    );

    // Assert
    expect(screen.getByRole("combobox")).toBeDisabled();
  });
});
