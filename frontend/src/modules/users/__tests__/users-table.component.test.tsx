import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { UsersTableComponent } from "../molecule/users-table.component";
import { useQuery, useMutation } from "@tanstack/react-query";

// Mocks
vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useQuery: vi.fn(),
    useMutation: vi.fn(),
  };
});

vi.mock("@lib/query.util", () => ({
  queryClient: {
    invalidateQueries: vi.fn(),
  },
}));

vi.mock("../services/user.service", () => ({
  getUsersList: vi.fn(),
  resetPasswordAttempt: vi.fn(),
  deactivateUserAttempt: vi.fn(),
  activateUserAttempt: vi.fn(),
  updateUserProfile: vi.fn(),
}));

const mockUsers = {
  data: [
    {
      id: "1",
      email: "user1@test.com",
      active: true,
      roles: ["ROLE_USER"],
      profile: {
        username: "User 1",
        registration: "REG123",
        position: "Dev",
        birth_date: null,
        work_regime: "HYBRID",
        lives_elsewhere: false,
        in_person_work_period: null,
      },
      audit: {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        updated_by: "system",
      },
    },
  ],
  meta: {
    pagination: {
      page: 0,
      pageSize: 50,
      totalItems: 1,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    },
  },
};

describe("UsersTableComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useQuery as Mock).mockReturnValue({
      data: mockUsers,
      isLoading: false,
      isRefetching: false,
      error: null,
      refetch: vi.fn(),
    });
    (useMutation as Mock).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });
  });

  it("renders users table with data", () => {
    render(<UsersTableComponent />);
    expect(screen.getByText("User 1")).toBeInTheDocument();
    expect(screen.getByText("user1@test.com")).toBeInTheDocument();
  });

  it("offers quick actions directly in the table row", () => {
    render(<UsersTableComponent />);
    expect(screen.getByTitle("Resetar Senha")).toBeInTheDocument();
    expect(screen.getByTitle("Desativar")).toBeInTheDocument();
  });

  it("opens redesigned details modal when clicking the eye icon button", async () => {
    render(<UsersTableComponent />);

    const detailsButton = screen.getByTitle("Ver Detalhes");
    fireEvent.click(detailsButton);

    await waitFor(() => {
      expect(screen.getByText("Detalhes do Usuário")).toBeInTheDocument();
      // Test the redesigned header content or new labels
      expect(screen.getByText(/Gerencie perfil, regime de trabalho/i)).toBeInTheDocument();
    });
  });

  it("shows high-level sections inside the premium details modal", async () => {
    render(<UsersTableComponent />);

    fireEvent.click(screen.getByTitle("Ver Detalhes"));

    await waitFor(() => {
      expect(screen.getByText("Informações do Perfil")).toBeInTheDocument();
      expect(screen.getByText("Regime & Localização")).toBeInTheDocument();
      expect(screen.getByText("Governança")).toBeInTheDocument();
    });
  });

  it("contains persist control inside the modal footer", async () => {
    render(<UsersTableComponent />);
    fireEvent.click(screen.getByTitle("Ver Detalhes"));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Persistir Alterações/i })).toBeInTheDocument();
    });
  });
});
