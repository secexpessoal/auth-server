import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@components/sh-form/form.component";
import { Input } from "@components/sh-input/input.component";

function FormDemo({ required = false }: { required?: boolean }) {
  const form = useForm<{ nome: string }>({
    defaultValues: { nome: "" },
    mode: "onChange",
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
  it("renderiza label, input e descrição corretamente", () => {
    // Arrange & Act
    render(<FormDemo />);

    // Assert
    expect(screen.getByText("Nome")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Digite seu nome")).toBeInTheDocument();
    expect(screen.getByText("Informe o seu nome completo.")).toBeInTheDocument();
  });

  it("aceita digitação no campo", async () => {
    // Arrange
    render(<FormDemo />);
    const input = screen.getByPlaceholderText("Digite seu nome");

    // Act
    await userEvent.type(input, "João Silva");

    // Assert
    expect(input).toHaveValue("João Silva");
  });

  it("exibe mensagem de erro ao tentar submeter campo obrigatório vazio", async () => {
    // Arrange
    render(<FormDemo required />);

    // Act
    const formElement = screen.getByRole("button", { name: "Enviar" }).closest("form");
    if (formElement) {
      fireEvent.submit(formElement);
    }

    // Assert
    expect(await screen.findByText("Nome é obrigatório")).toBeInTheDocument();
  });
});
