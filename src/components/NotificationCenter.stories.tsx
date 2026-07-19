import type { Meta, StoryObj } from "@storybook/react";
import { NotificationProvider } from "../providers/NotificationProvider";
import { NotificationCenter } from "./NotificationCenter";

const meta: Meta<typeof NotificationCenter> = {
  title: "Notification/Center",
  component: NotificationCenter,
  decorators: [
    (Story) => (
      <NotificationProvider
        initialNotifications={[
          {
            id: "1",
            title: "Build deployed",
            message: "Production deployment succeeded",
            timestamp: Date.now(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            type: "success",
            category: "DevOps",
            priority: "high",
            status: "new",
            read: false,
            archived: false,
            starred: false,
            pinned: true,
            sender: { id: "bot-1", name: "Release Bot" }
          }
        ]}
      >
        <Story />
      </NotificationProvider>
    )
  ]
};

export default meta;

type Story = StoryObj<typeof NotificationCenter>;

export const Default: Story = {};
