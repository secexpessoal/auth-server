import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Field, FieldContent, FieldError, FieldErrorState, FieldLabel } from "../field.component";
import { Input } from "@lib/components/sh-input/input.component";

describe("Field", () => {
  const user = userEvent.setup();

  describe("renderização", () => {
    it("deve renderizar com as props padrão", () => {
      render(
        <Field>
          <FieldLabel htmlFor="campo">E-mail</FieldLabel>
          <FieldContent>
            <Input id="campo" placeholder="Digite o e-mail" />
          </FieldContent>
        </Field>,
      );

      expect(screen.getByRole("group")).toBeInTheDocument();
      expect(screen.getByText("E-mail")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Digite o e-mail")).toBeInTheDocument();
    });

    it("deve aplicar a orientação horizontal corretamente", () => {
      render(<Field orientation="horizontal" data-testid="field" />);
      expect(screen.getByTestId("field")).toHaveAttribute("data-orientation", "horizontal");
    });
  });

  describe("estados", () => {
    it("deve renderizar FieldError com role=alert quando há erros", () => {
      render(<FieldError errors={[{ message: "Campo obrigatório" }]} />);
      expect(screen.getByRole("alert")).toHaveTextContent("Campo obrigatório");
    });

    it("não deve renderizar FieldError quando não há conteúdo", () => {
      const { container } = render(<FieldError errors={[]} />);
      expect(container).toBeEmptyDOMElement();
    });

    it("deve expor FieldErrorState para estilo de erro", () => {
      render(<FieldErrorState data-testid="error-state" />);
      expect(screen.getByTestId("error-state")).toHaveAttribute("data-slot", "field-error-state");
    });
  });

  describe("interação", () => {
    it("deve focar o input ao clicar no label", async () => {
      render(
        <Field>
          <FieldLabel htmlFor="campo">E-mail</FieldLabel>
          <FieldContent>
            <Input id="campo" placeholder="Digite o e-mail" />
          </FieldContent>
        </Field>,
      );

      await user.click(screen.getByText("E-mail"));
      expect(screen.getByPlaceholderText("Digite o e-mail")).toHaveFocus();
    });
  });

  describe("acessibilidade", () => {
    it("deve ter role=group no Field", () => {
      render(<Field />);
      expect(screen.getByRole("group")).toBeInTheDocument();
    });

    it("deve respeitar aria-label quando fornecido", () => {
      render(<Field aria-label="Campo genérico" />);
      expect(screen.getByRole("group", { name: "Campo genérico" })).toBeInTheDocument();
    });
  });
});
