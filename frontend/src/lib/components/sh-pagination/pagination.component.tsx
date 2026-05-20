import { type Button } from "@lib/components/sh-button/button.component";
import { buttonVariants } from "@lib/components/sh-button/button.variant";
import { cn } from "@lib/utils/cn/cn.util";
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react";

/**
 * Componente de paginação navegacional baseado em elementos semânticos `<nav>` e `<a>`. Use `PaginationLink` com `isActive` para marcar a página atual (`aria-current="page"`).
 * `PaginationPrevious` e `PaginationNext` já incluem `aria-label` acessíveis automaticamente.
 *
 * @param className - Classes CSS adicionais aplicadas ao elemento `<nav>`.
 * @param props - Demais props nativas do elemento `<nav>`.
 *
 * @example
 * // Paginação básica com anterior, links e próxima
 * <Pagination>
 *   <PaginationContent>
 *     <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
 *     <PaginationItem><PaginationLink href="#" isActive>1</PaginationLink></PaginationItem>
 *     <PaginationItem><PaginationNext href="#" /></PaginationItem>
 *   </PaginationContent>
 * </Pagination>
 *
 * @example
 * // Paginação com reticências para muitas páginas
 * <Pagination>
 *   <PaginationContent>
 *     <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
 *     <PaginationItem><PaginationLink href="#">1</PaginationLink></PaginationItem>
 *     <PaginationItem><PaginationEllipsis /></PaginationItem>
 *     <PaginationItem><PaginationLink href="#">10</PaginationLink></PaginationItem>
 *     <PaginationItem><PaginationNext href="#" /></PaginationItem>
 *   </PaginationContent>
 * </Pagination>
 */
function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul data-slot="pagination-content" className={cn("flex flex-row items-center gap-1", className)} {...props} />;
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">;

/**
 * @param isActive - Quando `true`, aplica `aria-current="page"` e estilo de destaque ao link.
 * @param size - Tamanho do botão herdado de `buttonVariants`. Padrão: `"icon"`.
 * @param className - Classes CSS adicionais.
 */
function PaginationLink({ className, isActive, size = "icon", ...props }: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        className,
      )}
      {...props}
    />
  );
}

function PaginationPrevious({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink aria-label="Go to previous pages" size="default" className={cn("gap-1 px-2.5 sm:pl-2.5", className)} {...props}>
      <ChevronLeftIcon />
      <span className="hidden sm:block">Previous</span>
    </PaginationLink>
  );
}

function PaginationNext({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink aria-label="Go to next pages" size="default" className={cn("gap-1 px-2.5 sm:pr-2.5", className)} {...props}>
      <span className="hidden sm:block">Next</span>
      <ChevronRightIcon />
    </PaginationLink>
  );
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span aria-hidden data-slot="pagination-ellipsis" className={cn("flex size-9 items-center justify-center", className)} {...props}>
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

export { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious };
