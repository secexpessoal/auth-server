import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../tooltip.component";

describe("Tooltip", () => {
  describe("renderização", () => {
    it("deve renderizar o trigger corretamente", () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Botão com dica</TooltipTrigger>
            <TooltipContent>Dica de uso</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      expect(screen.getByText("Botão com dica")).toBeInTheDocument();
    });

    it("não deve exibir o conteúdo antes do hover", () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Passe o mouse</TooltipTrigger>
            <TooltipContent>Dica oculta</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      expect(screen.queryByText("Dica oculta")).not.toBeInTheDocument();
    });
  });

  describe("estados", () => {
    it("deve exibir conteúdo ao fazer hover no trigger", async () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Hover aqui</TooltipTrigger>
            <TooltipContent>Informação extra</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      await userEvent.hover(screen.getByText("Hover aqui"));
      await waitFor(() => {
        expect(screen.getAllByText("Informação extra")[0]).toBeInTheDocument();
      });
    });

    it("deve ter data-slot correto no conteúdo após hover", async () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>T</TooltipTrigger>
            <TooltipContent data-testid="tip">Dica</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      await userEvent.hover(screen.getByText("T"));
      await waitFor(() => {
        const tips = screen.getAllByTestId("tip");
        expect(tips[0]).toHaveAttribute("data-slot", "tooltip-content");
      });
    });
  });

  describe("interação", () => {
    it("deve ocultar o conteúdo ao sair do hover", async () => {
      const user = userEvent.setup();
      render(
        <div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>Trigger</TooltipTrigger>
              <TooltipContent>Dica temporária</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <button type="button">Outro foco</button>
        </div>,
      );

      await user.tab();
      expect(screen.getByText("Trigger")).toHaveFocus();

      await waitFor(() => {
        const content = document.querySelector("[data-slot='tooltip-content']");
        expect(content).toBeInTheDocument();
        expect(["delayed-open", "instant-open"]).toContain(content?.getAttribute("data-state"));
      });

      await user.tab();
      expect(screen.getByRole("button", { name: "Outro foco" })).toHaveFocus();
      await waitFor(() => {
        const content = document.querySelector("[data-slot='tooltip-content']");
        if (!content) return;
        expect(content).toHaveAttribute("data-state", "closed");
      });
    });
  });

  describe("acessibilidade", () => {
    it("trigger deve ter data-slot=tooltip-trigger", () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger data-testid="trig">Dica</TooltipTrigger>
            <TooltipContent>Conteúdo</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      expect(screen.getByTestId("trig")).toHaveAttribute("data-slot", "tooltip-trigger");
    });

    it("trigger deve ter aria-describedby quando tooltip está aberto", async () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Abrir</TooltipTrigger>
            <TooltipContent>Descrição</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );
      await userEvent.hover(screen.getByText("Abrir"));
      await waitFor(() => {
        expect(screen.getByText("Abrir")).toHaveAttribute("aria-describedby");
      });
    });
  });
});
