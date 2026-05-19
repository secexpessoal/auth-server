import type { Meta, StoryObj } from "@storybook/react-vite";
import { within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CheckCircle } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { expect } from "vitest";
import { showToast } from "../toast.component";
import { Button } from "@lib/components/sh-button/button.component";

/**
 * Componente auxiliar de story que dispara toasts via `showToast`. Suporta variantes `info`, `warning`, `error` e `success` e ícone opcional.
 * Para acessibilidade, sempre use conteúdo textual visível; evite mensagens longas.
 */
function ToastTrigger({
  buttonText,
  message,
  variant,
  withIcon = false,
}: {
  buttonText: string;
  message: string;
  variant?: "info" | "warning" | "error" | "success";
  withIcon?: boolean;
}) {
  return (
    <Button
      onClick={() =>
        showToast({
          content: message,
          variant: variant ?? "success",
          icon: withIcon ? CheckCircle : undefined,
        })
      }
    >
      {buttonText}
    </Button>
  );
}

const meta = {
  title: "UI/Toast",
  component: ToastTrigger,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div>
        <Toaster position="bottom-right" />
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    buttonText: { description: "Texto do botão acionador", control: "text" },
    message: { description: "Mensagem exibida no toast", control: "text" },
    variant: {
      description: "Variante do toast",
      control: "select",
      options: ["info", "warning", "error", "success"],
    },
    withIcon: { description: "Exibe ícone ao lado da message", control: "boolean" },
  },
} satisfies Meta<typeof ToastTrigger>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    buttonText: "Mostrar toast",
    message: "Toast só com message.",
    variant: "success",
    withIcon: false,
  },
};

export const InfoVariant: Story = {
  args: { buttonText: "Mostrar info", message: "Informação importante.", variant: "info", withIcon: false },
};

export const WarningVariant: Story = {
  args: { buttonText: "Mostrar aviso", message: "Atenção ao preencher os dados.", variant: "warning", withIcon: false },
};

export const ErrorVariant: Story = {
  args: { buttonText: "Mostrar erro", message: "Não foi possível concluir a ação.", variant: "error", withIcon: false },
};

export const SuccessVariant: Story = {
  args: { buttonText: "Mostrar sucesso", message: "Operação concluída com sucesso.", variant: "success", withIcon: false },
};

export const WithIcon: Story = {
  args: { buttonText: "Mostrar com ícone", message: "Toast com ícone.", variant: "success", withIcon: true },
};

export const Interactive: Story = {
  args: {
    buttonText: "Mostrar toast",
    message: "Interação ok.",
    variant: "success",
    withIcon: false,
  },
  play: async ({ canvasElement }) => {
    const user = userEvent.setup();
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Mostrar toast" });
    await user.click(button);
    await expect(button).toHaveFocus();
    await expect(await canvas.findByText("Interação ok.")).toBeInTheDocument();
  },
};
