import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs.component";

describe("Tabs", () => {
  it("renders correctly and switches content", async () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>,
    );

    expect(screen.getByText("Content 1")).toBeInTheDocument();
    // In Radix Tabs, inactive content might be unmounted or hidden
    expect(screen.queryByText("Content 2")).not.toBeInTheDocument();

    const tab2 = screen.getByRole("tab", { name: /tab 2/i });
    await userEvent.click(tab2);

    expect(screen.getByText("Content 2")).toBeInTheDocument();
    expect(screen.queryByText("Content 1")).not.toBeInTheDocument();
  });

  it("handles disabled triggers correctly", async () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Active</TabsTrigger>
          <TabsTrigger value="tab2" disabled>
            Disabled
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>,
    );

    const disabledTab = screen.getByRole("tab", { name: /disabled/i });
    expect(disabledTab).toBeDisabled();

    await userEvent.click(disabledTab);
    expect(screen.getByText("Content 1")).toBeInTheDocument();
  });

  it("applies orientation correctly", () => {
    const { rerender } = render(
      <Tabs defaultValue="t1" orientation="horizontal">
        <TabsList>
          <TabsTrigger value="t1">T1</TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    expect(screen.getByRole("tablist").parentElement).toHaveAttribute("data-orientation", "horizontal");

    rerender(
      <Tabs defaultValue="t1" orientation="vertical">
        <TabsList>
          <TabsTrigger value="t1">T1</TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    expect(screen.getByRole("tablist").parentElement).toHaveAttribute("data-orientation", "vertical");
  });
});
