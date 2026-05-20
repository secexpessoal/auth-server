import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import toast, { Toaster } from "react-hot-toast";
import { showToast } from "../toast.component";

describe("Toast", () => {
  const user = userEvent.setup();

  afterEach(() => {
    toast.dismiss();
    toast.remove?.();
  });

  describe("renderização", () => {
    it("deve renderizar com as props padrão", async () => {
      render(<Toaster />);

      showToast({ content: "Mensagem de teste" });

      expect(await screen.findByText("Mensagem de teste")).toBeInTheDocument();
    });

    it("deve renderizar ícone quando fornecido", async () => {
      render(<Toaster />);

      const Icone = ({ className }: { className?: string }) => <svg aria-hidden data-testid="icone-toast" className={className} />;
      showToast({ content: "Com ícone", icon: Icone, variant: "error" });

      expect(await screen.findByText("Com ícone")).toBeInTheDocument();
      expect(screen.getByTestId("icone-toast")).toBeInTheDocument();
    });
  });

  describe("estados", () => {
    it("deve aplicar a variante error no ícone", async () => {
      render(<Toaster />);

      const Icone = ({ className }: { className?: string }) => <svg aria-hidden data-testid="icone-toast" className={className} />;
      showToast({ content: "Falha", icon: Icone, variant: "error" });

      await screen.findByText("Falha");
      expect(screen.getByTestId("icone-toast")).toHaveClass("text-destructive");
    });
  });

  describe("interação", () => {
    it("deve fechar ao clicar no botão de fechar", async () => {
      const { container } = render(<Toaster />);

      showToast({ content: "Fechar toast" });
      await screen.findByText("Fechar toast");

      const botaoFechar = container.querySelector<HTMLButtonElement>("[data-slot='button']");
      expect(botaoFechar).toBeTruthy();
      if (!botaoFechar) throw new Error("Não foi possível encontrar o botão de fechar do toast.");
      await user.click(botaoFechar);

      await waitFor(() => {
        const wrapper = screen.getByText("Fechar toast").closest("div");
        expect(wrapper).toBeTruthy();
        expect(wrapper).toHaveClass("animate-leave");
      });
    });
  });

  describe("acessibilidade", () => {
    it("deve expor um botão com role correto", async () => {
      render(<Toaster />);

      showToast({ content: "Acessível" });
      await screen.findByText("Acessível");

      const toastEl = screen.getByText("Acessível").closest("div");
      expect(toastEl).toBeTruthy();
      if (!toastEl) throw new Error("Não foi possível encontrar o container do toast.");

      expect(within(toastEl).getByRole("button")).toBeInTheDocument();
    });

    it("deve renderizar o conteúdo como texto visível", async () => {
      render(<Toaster />);

      showToast({ content: "Conteúdo visível" });

      expect(await screen.findByText("Conteúdo visível")).toBeInTheDocument();
    });
  });
});
