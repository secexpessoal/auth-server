import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DatePicker } from "../date-picker.component";

describe("DatePicker", () => {
  const user = userEvent.setup();

  describe("renderização", () => {
    it("deve renderizar com as props padrão", () => {
      render(<DatePicker />);
      expect(screen.getByRole("button")).toBeInTheDocument();
      expect(screen.getByText("Selecione uma data")).toBeInTheDocument();
    });

    it("deve renderizar com placeholder customizado", () => {
      render(<DatePicker placeholder="Escolha uma data" />);
      expect(screen.getByText("Escolha uma data")).toBeInTheDocument();
    });

    it("deve renderizar com uma data inicial via value", () => {
      render(<DatePicker value="2024-06-15" />);
      expect(screen.getByText("15/06/2024")).toBeInTheDocument();
    });
  });

  describe("estados", () => {
    it("deve estar desabilitado quando a prop disabled é verdadeira", () => {
      render(<DatePicker disabled />);
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });

  describe("interação", () => {
    it("deve abrir o calendário ao clicar no trigger", async () => {
      render(<DatePicker />);
      await user.click(screen.getByRole("button"));
      await waitFor(() => expect(screen.getByRole("grid")).toBeInTheDocument());
    });

    it("deve chamar onChange ao selecionar uma data", async () => {
      const onChange = vi.fn();
      render(<DatePicker onChange={onChange} />);

      await user.click(screen.getByRole("button"));
      const dia = await waitFor(() => document.querySelector<HTMLButtonElement>("button[data-day]:not([disabled])"));
      expect(dia).toBeTruthy();
      await user.click(dia!);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/));
      });
    });

    it("deve limpar a data ao clicar no ícone de limpar", async () => {
      const onChange = vi.fn();
      const { container } = render(<DatePicker value="2024-06-15" onChange={onChange} />);

      const limpar = container.querySelector<SVGElement>("svg.lucide-x");
      expect(limpar).toBeTruthy();

      if (limpar) {
        await user.click(limpar);
      }

      expect(onChange).toHaveBeenCalledWith(null);
    });
  });

  describe("acessibilidade", () => {
    it("deve expor o calendário com role=grid quando aberto", async () => {
      render(<DatePicker />);
      await user.click(screen.getByRole("button"));
      expect(screen.getByRole("grid")).toBeInTheDocument();
    });

    it("deve expor o trigger como botão", () => {
      render(<DatePicker />);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });
  });
});
