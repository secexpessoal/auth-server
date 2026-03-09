import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from "./card.component";
import { Button } from "@components/sh-button/button.component";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: (args) => (
    <Card {...args} className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description goes here.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the card content. You can put anything here.</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Action</Button>
      </CardFooter>
    </Card>
  ),
};

export const WithAction: Story = {
  render: (args) => (
    <Card {...args} className="w-[350px]">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>You have 3 unread messages.</CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon">
            ✕
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>New message from John Doe</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          Mark all as read
        </Button>
      </CardFooter>
    </Card>
  ),
};
