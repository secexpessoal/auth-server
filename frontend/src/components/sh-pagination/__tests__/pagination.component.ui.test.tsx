import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@components/sh-pagination/pagination.component";

describe("Pagination", () => {
  it("renderiza a navegação de paginação", () => {
    // Arrange & Act
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
            <PaginationNext href="#" size="default" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    // Assert
    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByLabelText("Go to previous page")).toBeInTheDocument();
    expect(screen.getByLabelText("Go to next page")).toBeInTheDocument();
  });

  it("PaginationLink com isActive possui aria-current='page'", () => {
    // Arrange & Act
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#" size="default" isActive>
              2
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    // Assert
    expect(screen.getByText("2").closest("a")).toHaveAttribute("aria-current", "page");
  });

  it("PaginationLink sem isActive não possui aria-current", () => {
    // Arrange & Act
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#" size="default">
              3
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    // Assert
    expect(screen.getByText("3").closest("a")).not.toHaveAttribute("aria-current");
  });
});
