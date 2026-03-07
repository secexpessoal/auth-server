import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@components/sh-input-group/input-group.component";

describe("InputGroup", () => {
  it("renderiza o grupo com um addon e um input", () => {
    // Arrange
    render(
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>@</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="usuário" />
      </InputGroup>,
    );

    // Assert
    expect(screen.getByPlaceholderText("usuário")).toBeInTheDocument();
    expect(screen.getByText("@")).toBeInTheDocument();
  });

  it("o input recebe foco ao clicar no addon", async () => {
    // Arrange
    render(
      <InputGroup>
        <InputGroupAddon data-testid="addon">
          <InputGroupText>@</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="foco" />
      </InputGroup>,
    );
    const addon = screen.getByTestId("addon");
    const input = screen.getByPlaceholderText("foco");

    // Act
    await userEvent.click(addon);

    // Assert
    expect(input).toHaveFocus();
  });

  it("renderiza e dispara clique no InputGroupButton", async () => {
    // Arrange
    const onClick = vi.fn();
    render(
      <InputGroup>
        <InputGroupInput placeholder="busca" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton onClick={onClick}>Buscar</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>,
    );

    // Act
    await userEvent.click(screen.getByRole("button", { name: "Buscar" }));

    // Assert
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renderiza InputGroupTextarea corretamente", () => {
    // Arrange
    render(
      <InputGroup>
        <InputGroupTextarea placeholder="mensagem" />
      </InputGroup>,
    );

    // Assert
    expect(screen.getByPlaceholderText("mensagem")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("mensagem").tagName).toBe("TEXTAREA");
  });

  it("aplica className customizado no InputGroup", () => {
    // Arrange
    render(
      <InputGroup className="custom-group" data-testid="group">
        <InputGroupInput placeholder="input" />
      </InputGroup>,
    );

    // Assert
    expect(screen.getByTestId("group")).toHaveClass("custom-group");
  });

  it("addon com align inline-end posiciona após o input", () => {
    // Arrange
    render(
      <InputGroup>
        <InputGroupInput placeholder="valor" />
        <InputGroupAddon align="inline-end" data-testid="addon-end">
          <InputGroupText>€</InputGroupText>
        </InputGroupAddon>
      </InputGroup>,
    );

    // Assert — verifica o atributo data-align
    expect(screen.getByTestId("addon-end")).toHaveAttribute("data-align", "inline-end");
  });
});
