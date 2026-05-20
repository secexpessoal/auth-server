import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarProvider, SidebarTrigger } from "../sidebar.component";

function SidebarDemo({ defaultOpen = true, variant = "sidebar" }: { defaultOpen?: boolean; variant?: "sidebar" | "floating" | "inset" }) {
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <Sidebar variant={variant}>
        <SidebarHeader>Menu</SidebarHeader>
        <SidebarContent>Conteúdo</SidebarContent>
      </Sidebar>
      <SidebarInset>
        <SidebarTrigger aria-label="Alternar menu lateral" />
      </SidebarInset>
    </SidebarProvider>
  );
}

describe("Sidebar", () => {
  const user = userEvent.setup();

  describe("renderização", () => {
    it("deve renderizar com as props padrão", () => {
      render(<SidebarDemo />);
      expect(document.querySelector("[data-slot='sidebar']")).toHaveAttribute("data-state", "expanded");
      expect(screen.getByText("Menu")).toBeInTheDocument();
      expect(screen.getByText("Conteúdo")).toBeInTheDocument();
    });

    it("deve aplicar a variante floating corretamente", () => {
      render(<SidebarDemo variant="floating" />);
      expect(document.querySelector("[data-slot='sidebar']")).toHaveAttribute("data-variant", "floating");
    });

    it("deve aplicar a variante inset corretamente", () => {
      render(<SidebarDemo variant="inset" />);
      expect(document.querySelector("[data-slot='sidebar']")).toHaveAttribute("data-variant", "inset");
    });
  });

  describe("estados", () => {
    it("deve iniciar colapsado quando defaultOpen é falso", () => {
      render(<SidebarDemo defaultOpen={false} />);
      expect(document.querySelector("[data-slot='sidebar']")).toHaveAttribute("data-state", "collapsed");
    });
  });

  describe("interação", () => {
    it("deve alternar o estado ao clicar no trigger", async () => {
      render(<SidebarDemo />);

      const sidebar = document.querySelector("[data-slot='sidebar']");
      expect(sidebar).toHaveAttribute("data-state", "expanded");

      const trigger = document.querySelector<HTMLButtonElement>("[data-slot='sidebar-trigger']");
      expect(trigger).toBeTruthy();

      if (trigger) {
        await user.click(trigger);
      }

      await waitFor(() => {
        expect(document.querySelector("[data-slot='sidebar']")).toHaveAttribute("data-state", "collapsed");
      });
    });

    it("deve alternar o estado pelo atalho Ctrl+B", async () => {
      render(<SidebarDemo />);

      expect(document.querySelector("[data-slot='sidebar']")).toHaveAttribute("data-state", "expanded");
      await user.keyboard("{Control>}b{/Control}");

      await waitFor(() => {
        expect(document.querySelector("[data-slot='sidebar']")).toHaveAttribute("data-state", "collapsed");
      });
    });
  });

  describe("acessibilidade", () => {
    it("deve ter role correto no trigger", () => {
      render(<SidebarDemo />);
      expect(screen.getByRole("button", { name: "Alternar menu lateral" })).toBeInTheDocument();
    });

    it("deve permitir foco por teclado no trigger", async () => {
      render(<SidebarDemo />);

      await user.tab();
      expect(screen.getByRole("button", { name: "Alternar menu lateral" })).toHaveFocus();
    });
  });
});
