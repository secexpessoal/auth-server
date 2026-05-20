import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea } from "../input-group.component";

describe("InputGroup", () => {
  const user = userEvent.setup();

  describe("renderização", () => {
    it("deve renderizar com as props padrão", () => {
      render(
        <InputGroup>
          <InputGroupAddon>
            <InputGroupText>@</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput placeholder="usuário" />
        </InputGroup>,
      );

      expect(screen.getByPlaceholderText("usuário")).toBeInTheDocument();
      expect(screen.getByText("@")).toBeInTheDocument();
    });

    it("deve aplicar o alinhamento inline-end no addon", () => {
      render(
        <InputGroup>
          <InputGroupInput placeholder="valor" />
          <InputGroupAddon align="inline-end" data-testid="addon-end">
            <InputGroupText>R$</InputGroupText>
          </InputGroupAddon>
        </InputGroup>,
      );

      expect(screen.getByTestId("addon-end")).toHaveAttribute("data-align", "inline-end");
    });
  });

  describe("estados", () => {
    it("deve aplicar className customizado no container", () => {
      render(
        <InputGroup className="custom-group" data-testid="group">
          <InputGroupInput placeholder="input" />
        </InputGroup>,
      );

      expect(screen.getByTestId("group")).toHaveClass("custom-group");
    });
  });

  describe("interação", () => {
    it("deve focar o input ao clicar no addon", async () => {
      render(
        <InputGroup>
          <InputGroupAddon data-testid="addon">
            <InputGroupText>@</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput placeholder="foco" />
        </InputGroup>,
      );

      await user.click(screen.getByTestId("addon"));
      expect(screen.getByPlaceholderText("foco")).toHaveFocus();
    });

    it("deve chamar onClick ao clicar no botão do grupo", async () => {
      const onClick = vi.fn();
      render(
        <InputGroup>
          <InputGroupInput placeholder="busca" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton onClick={onClick}>Buscar</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>,
      );

      await user.click(screen.getByRole("button", { name: "Buscar" }));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("acessibilidade", () => {
    it("deve renderizar textarea como <textarea>", () => {
      render(
        <InputGroup>
          <InputGroupTextarea placeholder="mensagem" />
        </InputGroup>,
      );

      expect(screen.getByPlaceholderText("mensagem").tagName).toBe("TEXTAREA");
    });

    it("deve permitir foco por teclado no input", async () => {
      render(
        <InputGroup>
          <InputGroupInput placeholder="tab" />
        </InputGroup>,
      );

      await user.tab();
      expect(screen.getByPlaceholderText("tab")).toHaveFocus();
    });
  });
});
