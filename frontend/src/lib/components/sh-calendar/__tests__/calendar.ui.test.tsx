import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ptBR } from "date-fns/locale";
import { describe, expect, it, vi } from "vitest";
import { Calendar } from "../calendar.component";

describe("Calendar", () => {
  const user = userEvent.setup();

  describe("renderização", () => {
    it("deve renderizar com as props padrão", () => {
      render(<Calendar mode="single" locale={ptBR} />);
      expect(screen.getByRole("grid")).toBeInTheDocument();
    });

    it("deve renderizar botões de navegação do mês", () => {
      const { container } = render(<Calendar mode="single" locale={ptBR} />);
      expect(container.querySelector("button.rdp-button_previous")).toBeInTheDocument();
      expect(container.querySelector("button.rdp-button_next")).toBeInTheDocument();
    });
  });

  describe("estados", () => {
    it("deve desabilitar dias quando a prop disabled bloqueia as datas", () => {
      const { container } = render(<Calendar mode="single" locale={ptBR} disabled={() => true} />);
      const primeiroDia = container.querySelector<HTMLButtonElement>("button[data-day]");
      expect(primeiroDia).toBeTruthy();
      expect(primeiroDia).toBeDisabled();
    });
  });

  describe("interação", () => {
    it("deve chamar onSelect ao selecionar um dia", async () => {
      const onSelect = vi.fn();
      const { container } = render(<Calendar mode="single" locale={ptBR} onSelect={onSelect} />);

      const primeiroDia = container.querySelector<HTMLButtonElement>("button[data-day]:not([disabled])");
      expect(primeiroDia).toBeTruthy();

      if (primeiroDia) {
        await user.click(primeiroDia);
      }

      await waitFor(() => {
        expect(onSelect).toHaveBeenCalled();
      });
    });
  });

  describe("acessibilidade", () => {
    it("deve expor role=grid para a grade de dias", () => {
      render(<Calendar mode="single" locale={ptBR} />);
      expect(screen.getByRole("grid")).toBeInTheDocument();
    });

    it("deve permitir foco no dia selecionável", async () => {
      const { container } = render(<Calendar mode="single" locale={ptBR} />);
      const primeiroDia = container.querySelector<HTMLButtonElement>("button[data-day]:not([disabled])");
      expect(primeiroDia).toBeTruthy();

      if (primeiroDia) {
        primeiroDia.focus();
        await waitFor(() => expect(primeiroDia).toHaveFocus());
      }
    });
  });
});
