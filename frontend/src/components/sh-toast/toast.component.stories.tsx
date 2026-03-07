import { Button } from "@components/sh-button/button.component";
import { showToast } from "./toast.component";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CheckCircle } from "lucide-react";
import { Toaster } from "react-hot-toast";

const meta: Meta = {
  title: "Ui/Common/Components/Feedback/Toast",
  parameters: {
    layout: "centered",
    docs: {
      story: {
        inline: false,
        iframeHeight: 150,
      },
    },
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
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Button
      onClick={() =>
        showToast({
          content: "Toast só com mensagem.",
        })
      }
    >
      Mostrar toast
    </Button>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <Button
      onClick={() =>
        showToast({
          content: "Toast com ícone.",
          icon: CheckCircle,
        })
      }
    >
      Mostrar Toast com ícone
    </Button>
  ),
};

