import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@components/sh-pagination/pagination.component";

describe("Pagination", () => {
  it("renders correctly", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" size="default" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" size="default">
              1
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" size="default" isActive>
              2
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis data-testid="ellipsis" />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" size="default" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    expect(screen.getByRole("navigation", { name: /pagination/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Go to previous page")).toBeInTheDocument();
    expect(screen.getByLabelText("Go to next page")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByTestId("ellipsis")).toBeInTheDocument();
  });

  it("marks the active link correctly", () => {
    render(
      <PaginationLink href="#" size="default" isActive>
        Active
      </PaginationLink>,
    );
    const link = screen.getByRole("link", { name: /active/i });
    expect(link).toHaveAttribute("aria-current", "page");
    expect(link).toHaveAttribute("data-active", "true");
  });
});
