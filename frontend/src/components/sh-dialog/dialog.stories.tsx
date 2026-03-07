import type { Meta, StoryObj } from "@storybook/react-vite";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./dialog.component";
import { Button } from "@components/sh-button/button.component";

const meta: Meta<typeof Dialog> = {
  title: "Components/Dialog",
  component: Dialog,
};

export default meta;

export const Default: StoryObj<typeof Dialog> = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Make changes to your profile here. Click save when you're done.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-right text-sm font-medium">Name</span>
            <input className="col-span-3 border p-2 rounded" placeholder="Pedro Duarte" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="text-right text-sm font-medium">Username</span>
            <input className="col-span-3 border p-2 rounded" placeholder="@peduarte" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
