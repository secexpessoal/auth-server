import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../form.component";
import { Input } from "@lib/components/sh-input/input.component";

function FormDemo({ required = false }: { required?: boolean }) {
  const form = useForm<{ nome: string }>({
    defaultValues: { nome: "" },
  });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => {})}>
        <FormField
          control={form.control}
          name="nome"
          rules={required ? { required: "Nome é obrigatório" } : undefined}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Digite seu nome" {...field} />
              </FormControl>
              <FormDescription>Informe o seu nome completo.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit">Enviar</button>
      </form>
    </Form>
  );
}

describe("Form", () => {
  const user = userEvent.setup();

  describe("renderização", () => {
    it("deve renderizar com as props padrão", () => {
      render(<FormDemo />);

      expect(screen.getByText("Nome")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Digite seu nome")).toBeInTheDocument();
      expect(screen.getByText("Informe o seu nome completo.")).toBeInTheDocument();
    });
  });

  describe("estados", () => {
    it("deve exibir mensagem de erro quando o campo é obrigatório e está vazio", async () => {
      render(<FormDemo required />);

      await user.click(screen.getByRole("button", { name: "Enviar" }));
      expect(await screen.findByText("Nome é obrigatório")).toBeInTheDocument();
    });
  });

  describe("interação", () => {
    it("deve aceitar digitação no campo", async () => {
      render(<FormDemo />);
      const input = screen.getByPlaceholderText("Digite seu nome");

      await user.type(input, "João Silva");
      expect(input).toHaveValue("João Silva");
    });

    it("deve permitir foco por teclado no campo", async () => {
      render(<FormDemo />);

      await user.tab();
      expect(screen.getByPlaceholderText("Digite seu nome")).toHaveFocus();
    });
  });

  describe("acessibilidade", () => {
    it("deve expor o botão de submit com role correto", () => {
      render(<FormDemo />);
      expect(screen.getByRole("button", { name: "Enviar" })).toBeInTheDocument();
    });

    it("deve permitir que o label esteja visível", () => {
      render(<FormDemo />);
      expect(screen.getByText("Nome")).toBeVisible();
    });
  });
});
