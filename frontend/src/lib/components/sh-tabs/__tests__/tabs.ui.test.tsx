import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs.component";

describe("Tabs", () => {
  describe("renderização", () => {
    it("deve renderizar com a aba padrão ativa", () => {
      render(
        <Tabs defaultValue="aba1">
          <TabsList>
            <TabsTrigger value="aba1">Aba 1</TabsTrigger>
            <TabsTrigger value="aba2">Aba 2</TabsTrigger>
          </TabsList>
          <TabsContent value="aba1">Conteúdo 1</TabsContent>
          <TabsContent value="aba2">Conteúdo 2</TabsContent>
        </Tabs>,
      );
      expect(screen.getByText("Conteúdo 1")).toBeInTheDocument();
      expect(screen.queryByText("Conteúdo 2")).not.toBeInTheDocument();
    });

    it("deve renderizar com data-slot correto nas abas", () => {
      render(
        <Tabs defaultValue="a">
          <TabsList data-testid="list">
            <TabsTrigger value="a">A</TabsTrigger>
          </TabsList>
          <TabsContent value="a">Conteúdo A</TabsContent>
        </Tabs>,
      );
      expect(screen.getByTestId("list")).toHaveAttribute("data-slot", "tabs-list");
    });

    it("deve renderizar com orientação vertical", () => {
      render(
        <Tabs defaultValue="a" orientation="vertical">
          <TabsList>
            <TabsTrigger value="a">A</TabsTrigger>
          </TabsList>
          <TabsContent value="a">Conteúdo A</TabsContent>
        </Tabs>,
      );
      expect(screen.getByRole("tablist").parentElement).toHaveAttribute("data-orientation", "vertical");
    });
  });

  describe("estados", () => {
    it("aba desabilitada não muda o conteúdo ao clicar", async () => {
      render(
        <Tabs defaultValue="aba1">
          <TabsList>
            <TabsTrigger value="aba1">Aba 1</TabsTrigger>
            <TabsTrigger value="aba2" disabled>
              Aba 2
            </TabsTrigger>
          </TabsList>
          <TabsContent value="aba1">Conteúdo 1</TabsContent>
          <TabsContent value="aba2">Conteúdo 2</TabsContent>
        </Tabs>,
      );
      await userEvent.click(screen.getByRole("tab", { name: /aba 2/i }));
      expect(screen.getByText("Conteúdo 1")).toBeInTheDocument();
      expect(screen.queryByText("Conteúdo 2")).not.toBeInTheDocument();
    });

    it("deve marcar a aba ativa com aria-selected", () => {
      render(
        <Tabs defaultValue="aba1">
          <TabsList>
            <TabsTrigger value="aba1">Aba 1</TabsTrigger>
          </TabsList>
          <TabsContent value="aba1">Conteúdo 1</TabsContent>
        </Tabs>,
      );
      expect(screen.getByRole("tab", { name: /aba 1/i })).toHaveAttribute("aria-selected", "true");
    });
  });

  describe("interação", () => {
    it("deve trocar o conteúdo ao clicar em outra aba", async () => {
      render(
        <Tabs defaultValue="aba1">
          <TabsList>
            <TabsTrigger value="aba1">Aba 1</TabsTrigger>
            <TabsTrigger value="aba2">Aba 2</TabsTrigger>
          </TabsList>
          <TabsContent value="aba1">Conteúdo 1</TabsContent>
          <TabsContent value="aba2">Conteúdo 2</TabsContent>
        </Tabs>,
      );
      await userEvent.click(screen.getByRole("tab", { name: /aba 2/i }));
      expect(screen.getByText("Conteúdo 2")).toBeInTheDocument();
      expect(screen.queryByText("Conteúdo 1")).not.toBeInTheDocument();
    });

    it("deve navegar entre abas com teclas de seta", async () => {
      render(
        <Tabs defaultValue="aba1">
          <TabsList>
            <TabsTrigger value="aba1">Aba 1</TabsTrigger>
            <TabsTrigger value="aba2">Aba 2</TabsTrigger>
          </TabsList>
          <TabsContent value="aba1">Conteúdo 1</TabsContent>
          <TabsContent value="aba2">Conteúdo 2</TabsContent>
        </Tabs>,
      );
      screen.getByRole("tab", { name: /aba 1/i }).focus();
      await userEvent.keyboard("{ArrowRight}");
      expect(screen.getByRole("tab", { name: /aba 2/i })).toHaveFocus();
    });
  });

  describe("acessibilidade", () => {
    it("deve ter role tablist na lista de abas", () => {
      render(
        <Tabs defaultValue="a">
          <TabsList>
            <TabsTrigger value="a">A</TabsTrigger>
          </TabsList>
          <TabsContent value="a">Conteúdo</TabsContent>
        </Tabs>,
      );
      expect(screen.getByRole("tablist")).toBeInTheDocument();
    });

    it("deve ter role tab nos gatilhos", () => {
      render(
        <Tabs defaultValue="a">
          <TabsList>
            <TabsTrigger value="a">Aba A</TabsTrigger>
          </TabsList>
          <TabsContent value="a">Conteúdo</TabsContent>
        </Tabs>,
      );
      expect(screen.getByRole("tab", { name: "Aba A" })).toBeInTheDocument();
    });

    it("deve ter role tabpanel no conteúdo ativo", () => {
      render(
        <Tabs defaultValue="a">
          <TabsList>
            <TabsTrigger value="a">Aba A</TabsTrigger>
          </TabsList>
          <TabsContent value="a">Conteúdo</TabsContent>
        </Tabs>,
      );
      expect(screen.getByRole("tabpanel")).toBeInTheDocument();
    });
  });
});
