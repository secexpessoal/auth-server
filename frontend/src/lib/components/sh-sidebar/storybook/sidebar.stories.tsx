import type { Meta, StoryObj } from "@storybook/react-vite";
import { within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "../sidebar.component";
import { expect } from "vitest";

function SidebarScenario({
  variant = "sidebar",
  triggerDisabled = false,
  menuDisabled = false,
}: {
  variant?: "sidebar" | "floating" | "inset";
  triggerDisabled?: boolean;
  menuDisabled?: boolean;
}) {
  return (
    <div className="h-[420px] w-full border rounded-xl overflow-hidden">
      <SidebarProvider defaultOpen>
        <Sidebar variant={variant}>
          <SidebarHeader className="px-3 py-2 font-medium">Navegação</SidebarHeader>
          <SidebarContent className="px-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton disabled={menuDisabled}>Início</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>Relatórios</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="p-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger aria-label="Alternar menu lateral" disabled={triggerDisabled} />
            <h2 className="text-sm font-medium">Conteúdo</h2>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Área principal da página.</p>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

const meta = {
  title: "UI/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    variant: { description: "Variante visual do sidebar", control: "select", options: ["sidebar", "floating", "inset"] },
  },
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <SidebarScenario variant="sidebar" />,
};

export const FloatingVariant: Story = {
  render: () => <SidebarScenario variant="floating" />,
};

export const InsetVariant: Story = {
  render: () => <SidebarScenario variant="inset" />,
};

export const DisabledState: Story = {
  render: () => <SidebarScenario variant="sidebar" triggerDisabled menuDisabled />,
};

export const Interactive: Story = {
  render: () => <SidebarScenario variant="sidebar" />,
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const canvas = within(canvasElement);
    const sidebar = canvasElement.querySelector("[data-slot='sidebar']");
    expect(sidebar).toHaveAttribute("data-state", "expanded");

    const trigger = canvas.getByRole("button", { name: "Alternar menu lateral" });
    await user.click(trigger);
    await expect(trigger).toHaveFocus();

    await expect(canvasElement.querySelector("[data-slot='sidebar']")).toHaveAttribute("data-state", "collapsed");
  },
};
