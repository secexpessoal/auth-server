import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/sh-tabs/tabs.component";

describe("Tabs", () => {
  it("troca o conteúdo ao clicar em outra aba", async () => {
    // Arrange
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

    // Act
    await userEvent.click(screen.getByRole("tab", { name: /aba 2/i }));

    // Assert
    expect(screen.getByText("Conteúdo 2")).toBeInTheDocument();
    expect(screen.queryByText("Conteúdo 1")).not.toBeInTheDocument();
  });

  it("aba desabilitada não muda o conteúdo", async () => {
    // Arrange
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

    // Act
    await userEvent.click(screen.getByRole("tab", { name: /aba 2/i }));

    // Assert
    expect(screen.getByText("Conteúdo 1")).toBeInTheDocument();
    expect(screen.queryByText("Conteúdo 2")).not.toBeInTheDocument();
  });

  it("aplica orientação vertical quando especificado", () => {
    // Arrange & Act
    render(
      <Tabs defaultValue="a" orientation="vertical">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
      </Tabs>,
    );

    // Assert
    expect(screen.getByRole("tablist").parentElement).toHaveAttribute("data-orientation", "vertical");
  });
});
