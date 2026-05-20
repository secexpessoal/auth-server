import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RadioGroup, RadioGroupItem } from "../radio-check.component";

describe("RadioGroup", () => {
  describe("renderização", () => {
    it("deve renderizar o grupo com os itens corretamente", () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="opcao1" aria-label="Opção 1" />
          <RadioGroupItem value="opcao2" aria-label="Opção 2" />
        </RadioGroup>,
      );
      expect(screen.getAllByRole("radio")).toHaveLength(2);
    });

    it("deve aplicar variante horizontal com flex-row", () => {
      render(
        <RadioGroup variant="horizontal" data-testid="grupo">
          <RadioGroupItem value="a" aria-label="A" />
        </RadioGroup>,
      );
      expect(screen.getByTestId("grupo")).toHaveClass("flex", "flex-row");
    });

    it("deve aplicar variante vertical (padrão) com grid", () => {
      render(
        <RadioGroup data-testid="grupo">
          <RadioGroupItem value="a" aria-label="A" />
        </RadioGroup>,
      );
      expect(screen.getByTestId("grupo")).toHaveClass("grid");
    });

    it("deve refletir o valor controlado", () => {
      render(
        <RadioGroup value="b">
          <RadioGroupItem value="a" aria-label="A" />
          <RadioGroupItem value="b" aria-label="B" />
        </RadioGroup>,
      );
      expect(screen.getByRole("radio", { name: "B" })).toBeChecked();
      expect(screen.getByRole("radio", { name: "A" })).not.toBeChecked();
    });
  });

  describe("estados", () => {
    it("deve estar desabilitado quando a prop disabled é verdadeira", () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="a" aria-label="A" disabled />
        </RadioGroup>,
      );
      expect(screen.getByRole("radio", { name: "A" })).toBeDisabled();
    });

    it("deve ter data-slot correto nos itens", () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="a" aria-label="A" data-testid="item" />
        </RadioGroup>,
      );
      expect(screen.getByTestId("item")).toHaveAttribute("data-slot", "radio-group-item");
    });
  });

  describe("interação", () => {
    it("deve selecionar um item ao clicar", async () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="a" aria-label="A" />
          <RadioGroupItem value="b" aria-label="B" />
        </RadioGroup>,
      );
      await userEvent.click(screen.getByRole("radio", { name: "A" }));
      expect(screen.getByRole("radio", { name: "A" })).toBeChecked();
    });

    it("não deve selecionar item desabilitado ao clicar", async () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="a" aria-label="A" disabled />
        </RadioGroup>,
      );
      await userEvent.click(screen.getByRole("radio", { name: "A" }));
      expect(screen.getByRole("radio", { name: "A" })).not.toBeChecked();
    });

    it("deve chamar onValueChange ao selecionar", async () => {
      const onValueChange = vi.fn();
      render(
        <RadioGroup onValueChange={onValueChange}>
          <RadioGroupItem value="opcao" aria-label="Opção" />
        </RadioGroup>,
      );
      await userEvent.click(screen.getByRole("radio", { name: "Opção" }));
      expect(onValueChange).toHaveBeenCalledWith("opcao");
    });
  });

  describe("acessibilidade", () => {
    it("deve ter role=radiogroup no grupo", () => {
      render(
        <RadioGroup aria-label="tipo de processo">
          <RadioGroupItem value="a" aria-label="A" />
        </RadioGroup>,
      );
      expect(screen.getByRole("radiogroup", { name: "tipo de processo" })).toBeInTheDocument();
    });

    it("deve ter role=radio em cada item", () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="a" aria-label="Aposentadoria" />
        </RadioGroup>,
      );
      expect(screen.getByRole("radio", { name: "Aposentadoria" })).toBeInTheDocument();
    });
  });
});
