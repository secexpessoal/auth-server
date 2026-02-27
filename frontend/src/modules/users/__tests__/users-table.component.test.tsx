import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { UsersTableComponent } from "../molecule/users-table.component";
import { useQuery, useMutation } from "@tanstack/react-query";

// Mocks
vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
}));

vi.mock("../services/user.service", () => ({
  getUsersList: vi.fn(),
  resetPasswordAttempt: vi.fn(),
  deactivateUserAttempt: vi.fn(),
  activateUserAttempt: vi.fn(),
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

  it("shows confirmation dialog when clicking reset password", async () => {
    render(<UsersTableComponent />);

    // Use getAllByRole as there are multiple action buttons
    const resetButtons = screen.getAllByRole("button", { name: /resetar/i });
    fireEvent.click(resetButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/confirmar reset de senha/i)).toBeInTheDocument();
    });
  });
});
