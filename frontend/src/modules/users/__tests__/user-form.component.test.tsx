import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { axiosClient } from "../../../lib/axios/axios.util";
import { CreateUserDialog } from "../user-form.component";

// Mock axios implementation to not make real requests
vi.mock("../../../lib/axios-client.util", () => ({
  axiosClient: {
    post: vi.fn(),
  },
}));

describe("CreateUserDialog UI Rendering", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
  });

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <CreateUserDialog role="ADMIN" />
      </QueryClientProvider>,
    );

  it("Deve renderizar o botão trigger, abri-lo e exibir os 3 campos e botão de submit", async () => {
    renderComponent();

    const triggerButton = screen.getByRole("button", { name: /novo admin/i });
    expect(triggerButton).toBeInTheDocument();

    // Open the dialog
    fireEvent.click(triggerButton);

    await waitFor(() => {
      expect(screen.getByLabelText("Nome de Usuário")).toBeInTheDocument();
      expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
      expect(screen.getByLabelText("Senha")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /salvar administrador/i })).toBeInTheDocument();
    });
  });

  // TanStack Form is async and can take a few ticks to flush the schema format
  it("Deve impedir a submissão com dados inválidos sem chamar a API", async () => {
    renderComponent();

    const triggerButton = screen.getByRole("button", { name: /novo admin/i });
    fireEvent.click(triggerButton);

    // Wait for modal to open
    const submitButton = await screen.findByRole("button", { name: /salvar administrador/i });

    // Clicking submit without filling anything should block the mutation
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axiosClient.post).not.toHaveBeenCalled();
    });
  });
});
