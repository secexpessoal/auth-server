import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ButtonGroup, ButtonGroupText, ButtonGroupSeparator } from "@components/sh-button-group/button-group.component";
import { Button } from "@components/sh-button/button.component";

describe("ButtonGroup", () => {
  it("renderiza botões agrupados corretamente", () => {
    // Arrange & Act
    render(
      <ButtonGroup>
        <Button>Um</Button>
        <Button>Dois</Button>
      </ButtonGroup>,
    );

    // Assert
    expect(screen.getByRole("group")).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });

  it("renderiza ButtonGroupText como texto auxiliar", () => {
    // Arrange & Act
    render(
      <ButtonGroup>
        <ButtonGroupText>Prefixo</ButtonGroupText>
        <Button>Ação</Button>
      </ButtonGroup>,
    );

    // Assert
    expect(screen.getByText("Prefixo")).toBeInTheDocument();
  });

  it("renderiza ButtonGroupSeparator visualmente", () => {
    // Arrange & Act
    render(
      <ButtonGroup>
        <Button>A</Button>
        <ButtonGroupSeparator />
        <Button>B</Button>
      </ButtonGroup>,
    );

    // Assert — separador com data-slot
    expect(document.querySelector("[data-slot='button-group-separator']")).toBeInTheDocument();
  });

  it("dispara click nos botões filhos", async () => {
    // Arrange
    const onClick = vi.fn();
    render(
      <ButtonGroup>
        <Button onClick={onClick}>Clique</Button>
      </ButtonGroup>,
    );

    // Act
    await userEvent.click(screen.getByRole("button", { name: "Clique" }));

    // Assert
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
