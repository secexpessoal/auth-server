import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../pagination.component";

describe("Pagination", () => {
  describe("renderização", () => {
    it("deve renderizar a estrutura de navegação", () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>,
      );
      expect(screen.getByRole("navigation")).toBeInTheDocument();
      expect(document.querySelectorAll("[data-slot='pagination-link']")).toHaveLength(3);
    });

    it("deve renderizar o número da página", () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="#">5</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>,
      );
      expect(screen.getByText("5")).toBeInTheDocument();
    });
  });

  describe("estados", () => {
    it("deve ter aria-current=page na página ativa", () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                2
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>,
      );
      expect(screen.getByText("2").closest("a")).toHaveAttribute("aria-current", "page");
    });

    it("não deve ter aria-current na página inativa", () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>,
      );
      expect(screen.getByText("3").closest("a")).not.toHaveAttribute("aria-current");
    });
  });

  describe("interação", () => {
    it("deve chamar handler ao clicar no link de página", async () => {
      const onClick = vi.fn();
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="#" onClick={onClick}>
                1
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>,
      );
      await userEvent.click(screen.getByText("1"));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("deve chamar handler ao clicar em Próximo", async () => {
      const onClick = vi.fn();
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationNext href="#" onClick={onClick} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>,
      );
      const next = document.querySelector<HTMLAnchorElement>("[data-slot='pagination-link'][aria-label]");
      expect(next).toBeTruthy();
      if (next) {
        await userEvent.click(next);
      }
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("acessibilidade", () => {
    it("deve ter role=navigation", () => {
      render(<Pagination />);
      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("deve ter aria-label=pagination na nav", () => {
      render(<Pagination />);
      expect(screen.getByRole("navigation")).toHaveAttribute("aria-label", "pagination");
    });
  });
});
