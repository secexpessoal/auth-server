import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select.component";

describe("Select", () => {
  describe("renderização", () => {
    it("deve renderizar o trigger com placeholder", () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma opção" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Opção A</SelectItem>
          </SelectContent>
        </Select>,
      );
      expect(screen.getByText("Selecione uma opção")).toBeInTheDocument();
    });

    it("deve ter role=combobox no trigger", () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Escolha" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">A</SelectItem>
          </SelectContent>
        </Select>,
      );
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });
  });

  describe("estados", () => {
    it("deve estar desabilitado quando a prop disabled é passada", () => {
      render(
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Desabilitado" />
          </SelectTrigger>
        </Select>,
      );
      expect(screen.getByRole("combobox")).toBeDisabled();
    });
  });

  describe("interação", () => {
    it("deve abrir as opções ao clicar no trigger", async () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Escolha" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="op1">Aposentadoria</SelectItem>
            <SelectItem value="op2">Revisão</SelectItem>
          </SelectContent>
        </Select>,
      );
      await userEvent.click(screen.getByRole("combobox"));
      await waitFor(() => {
        expect(screen.getByText("Aposentadoria")).toBeInTheDocument();
        expect(screen.getByText("Revisão")).toBeInTheDocument();
      });
    });

    it("deve selecionar um item ao clicar nele", async () => {
      const onValueChange = vi.fn();
      render(
        <Select onValueChange={onValueChange}>
          <SelectTrigger>
            <SelectValue placeholder="Escolha" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="aposentadoria">Aposentadoria</SelectItem>
          </SelectContent>
        </Select>,
      );
      await userEvent.click(screen.getByRole("combobox"));
      await waitFor(() => screen.getByText("Aposentadoria"));
      await userEvent.click(screen.getByText("Aposentadoria"));
      expect(onValueChange).toHaveBeenCalledWith("aposentadoria");
    });

    it("deve fechar ao pressionar Escape", async () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Escolha" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Opção A</SelectItem>
          </SelectContent>
        </Select>,
      );
      await userEvent.click(screen.getByRole("combobox"));
      await waitFor(() => screen.getByText("Opção A"));
      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(screen.queryByText("Opção A")).not.toBeInTheDocument());
    });
  });

  describe("acessibilidade", () => {
    it("deve ter role=combobox no trigger", () => {
      render(
        <Select>
          <SelectTrigger aria-label="tipo de processo">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">A</SelectItem>
          </SelectContent>
        </Select>,
      );
      expect(screen.getByRole("combobox", { name: "tipo de processo" })).toBeInTheDocument();
    });

    it("deve ter aria-expanded=false quando fechado", () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">A</SelectItem>
          </SelectContent>
        </Select>,
      );
      expect(screen.getByRole("combobox")).toHaveAttribute("aria-expanded", "false");
    });
  });
});
