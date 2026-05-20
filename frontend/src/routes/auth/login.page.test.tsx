import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { LoginPage } from "@routes/auth/login.page";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";

// Mocks
vi.mock("@tanstack/react-router", () => ({
  useNavigate: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: vi.fn(),
}));

vi.mock("../services/auth.service", () => ({
  loginAttempt: vi.fn(),
}));

describe("LoginPage", () => {
  const navigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as Mock).mockReturnValue(navigate);
    (useMutation as Mock).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
  });

  it("renders login form elements", () => {
    render(<LoginPage />);
    expect(screen.getByText(/painel admin/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/admin@exemplo.com/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /esqueceu sua senha\?/i })).toBeInTheDocument();
  });

  it("opens forgot password dialog when clicking the link", async () => {
    const { userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();

    render(<LoginPage />);

    const forgotPasswordBtn = screen.getByRole("button", { name: /esqueceu sua senha\?/i });
    await user.click(forgotPasswordBtn);

    expect(screen.getByText(/recuperar senha/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/exemplo@empresa.com/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /enviar nova senha/i })).toBeInTheDocument();
  });
});
