import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { UsersTableComponent } from "../atom/users-table.component";
import { useQuery, useMutation } from "@tanstack/react-query";

// Mock ResizeObserver for Radix UI components
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock as typeof globalThis.ResizeObserver;

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
        birthDate: null,
        workRegime: "HYBRID",
        livesElsewhere: false,
        inPersonWorkPeriod: null,
      },
      audit: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updatedBy: "system",
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
      expect(screen.getByText("Detalhes")).toBeInTheDocument();
      // Test the redesigned header content or new labels
      expect(screen.getByText(/Perfil de acesso de/i)).toBeInTheDocument();
    });
  });

  it("shows tabs inside the premium details modal", async () => {
    render(<UsersTableComponent />);

    fireEvent.click(screen.getByTitle("Ver Detalhes"));

    await waitFor(() => {
      // Tab triggers
      expect(screen.getByRole("tab", { name: /Informações do Perfil/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /Regime & Localização/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /Governança/i })).toBeInTheDocument();

      // Current active tab content
      expect(screen.getByRole("heading", { name: /Informações do Perfil/i })).toBeInTheDocument();
    });
  });

  it("contains persist control inside the modal footer", async () => {
    render(<UsersTableComponent />);
    fireEvent.click(screen.getByTitle("Ver Detalhes"));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Persistir Alterações/i })).toBeInTheDocument();
    });
  });

  it("interacts with the Shadcn Select for work regime after switching tab", async () => {
    render(<UsersTableComponent />);
    fireEvent.click(screen.getByTitle("Ver Detalhes"));

    await waitFor(() => {
      const tab = screen.getByRole("tab", { name: /Regime & Localização/i });
      fireEvent.mouseDown(tab);
      fireEvent.click(tab);
    });

    await waitFor(
      () => {
        // Check for the trigger. Radix Select renders a button with role combobox
        expect(screen.getByRole("combobox")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("renders the premium Shadcn DatePicker after switching tab", async () => {
    render(<UsersTableComponent />);
    fireEvent.click(screen.getByTitle("Ver Detalhes"));

    await waitFor(() => {
      const tab = screen.getByRole("tab", { name: /Regime & Localização/i });
      // Try switching more aggressively if click is failing
      fireEvent.mouseDown(tab);
      fireEvent.click(tab);
    });

    await waitFor(
      () => {
        // The DatePicker trigger is a button that shows the placeholder or formatted date
        expect(screen.getByText(/Selecione a data/i)).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });
});
