import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@components/sh-alert-dialog/alert-dialog.component";

describe("AlertDialog", () => {
  it("opens and displays content correctly", async () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm?</AlertDialogTitle>
            <AlertDialogDescription>Message</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline" size="default">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction variant="default" size="default">
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );

    fireEvent.click(screen.getByText("Open"));

    await waitFor(() => {
      expect(screen.getByText("Confirm?")).toBeInTheDocument();
      expect(screen.getByText("Message")).toBeInTheDocument();
    });
  });

  it("closes when cancel or action is clicked", async () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Confirm?</AlertDialogTitle>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline" size="default">
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );

    fireEvent.click(screen.getByText("Open"));

    await waitFor(() => screen.getByText("Confirm?"));

    fireEvent.click(screen.getByText("Cancel"));

    await waitFor(() => {
      expect(screen.queryByText("Confirm?")).not.toBeInTheDocument();
    });
  });
});
