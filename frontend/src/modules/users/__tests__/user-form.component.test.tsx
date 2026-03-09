import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateUserDialog } from "@modules/users/atom/user-form.component";

// Mocks
vi.mock("../services/user.service", () => ({
  registerAdminAttempt: vi.fn(),
  registerUserAttempt: vi.fn(),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("CreateUserDialog", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  const renderComponent = (props: { role: "ADMIN" | "USER" } = { role: "ADMIN" }) =>
    render(
      <QueryClientProvider client={queryClient}>
        <CreateUserDialog {...props} />
      </QueryClientProvider>,
    );

  it("renders trigger button correctly", () => {
    renderComponent({ role: "ADMIN" });
    expect(screen.getByText(/novo admin/i)).toBeInTheDocument();
  });

  it("opens dialog on click", async () => {
    renderComponent({ role: "ADMIN" });
    fireEvent.click(screen.getByText(/novo admin/i));

    await waitFor(() => {
      expect(screen.getByText(/cadastrar novo administrador/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/nome de usuário/i)).toBeInTheDocument();
    });
  });
});
