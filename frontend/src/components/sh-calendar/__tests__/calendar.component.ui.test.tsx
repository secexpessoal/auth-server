import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Calendar } from "@components/sh-calendar/calendar.component";

describe("Calendar", () => {
  it("renderiza o calendário com a grade de dias", () => {
    // Arrange & Act
    render(<Calendar mode="single" />);

    // Assert
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("renderiza os botões de navegação de mês", () => {
    // Arrange & Act
    render(<Calendar mode="single" />);

    // Assert
    expect(screen.getByLabelText("Go to the Previous Month")).toBeInTheDocument();
    expect(screen.getByLabelText("Go to the Next Month")).toBeInTheDocument();
  });

  it("seleciona uma data ao clicar em um dia", async () => {
    // Arrange
    let selected: Date | undefined;
    render(
      <Calendar
        mode="single"
        selected={selected}
        onSelect={(d) => {
          selected = d;
        }}
      />,
    );

    // Act — clica no primeiro botão de dia disponível
    const dayButtons = screen.getAllByRole("gridcell");
    const firstClickable = dayButtons.find((el) => !el.hasAttribute("disabled") && el.textContent?.trim());
    if (firstClickable) {
      const btn = firstClickable.querySelector("button");
      if (btn) await userEvent.click(btn);
    }

    // Assert
    await waitFor(() => {
      expect(selected).toBeDefined();
    });
  });
});
