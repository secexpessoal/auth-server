import { fireEvent, render, screen } from "@testing-library/react";
import toast from "react-hot-toast";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { showToast } from "@components/sh-toast/toast.component";

// Mock react-hot-toast
vi.mock("react-hot-toast", () => {
  const toastMock = vi.fn();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  toastMock.dismiss = vi.fn();
  return {
    default: toastMock,
  };
});

describe("Função showToast (UI)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (toast.dismiss as Mock).mockClear();
  });

  it("Deve chamar toast com o conteúdo correto e duração padrão", () => {
    showToast({ content: "Test message" });
    expect(toast).toHaveBeenCalledWith(expect.any(Function), {
      duration: 4000,
    });
  });

  it("Deve chamar toast com uma duração personalizada", () => {
    showToast({ content: "Test message", duration: 5000 });
    expect(toast).toHaveBeenCalledWith(expect.any(Function), {
      duration: 5000,
    });
  });

  it("Deve renderizar o ícone quando fornecido", () => {
    const Icon = () => <svg data-testid="icon" />;
    showToast({ content: "Test message", icon: Icon });

    const toastFunction = (toast as unknown as Mock).mock.calls[0][0];
    const toastComponent = toastFunction({ visible: true, id: "1" });

    render(toastComponent);

    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("Deve renderizar o conteúdo", () => {
    showToast({ content: "My Toast Content" });

    const toastFunction = (toast as unknown as Mock).mock.calls[0][0];
    const toastComponent = toastFunction({ visible: true, id: "1" });

    render(toastComponent);

    expect(screen.getByText("My Toast Content")).toBeInTheDocument();
  });

  it("Deve chamar toast.dismiss quando o botão de fechar é clicado", () => {
    showToast({ content: "Test message" });

    const toastFunction = (toast as unknown as Mock).mock.calls[0][0];
    const toastComponent = toastFunction({ visible: true, id: "1" });

    render(toastComponent);

    const closeButton = screen.getByRole("button");
    fireEvent.click(closeButton);

    expect(toast.dismiss).toHaveBeenCalledWith("1");
  });
});
