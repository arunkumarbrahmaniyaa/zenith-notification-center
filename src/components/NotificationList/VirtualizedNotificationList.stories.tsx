import type { Meta, StoryObj } from "@storybook/react";
import { VirtualizedNotificationList } from "./VirtualizedNotificationList";
import type { NotificationItem } from "../../types";

const makeItems = (count: number): NotificationItem[] =>
  Array.from({ length: count }, (_, index) => {
    const now = Date.now() - index * 60_000;
    return {
      id: `n-${index}`,
      title: `Notification #${index + 1}`,
      message: `This is the body for notification number ${index + 1}.`,
      timestamp: now,
      createdAt: new Date(now).toISOString(),
      updatedAt: new Date(now).toISOString(),
      type: index % 4 === 0 ? "success" : index % 4 === 1 ? "warning" : index % 4 === 2 ? "info" : "error",
      category: "demo",
      priority: "medium",
      status: "new",
      read: index % 3 === 0,
      archived: false,
      starred: false,
      pinned: false
    } satisfies NotificationItem;
  });

const meta: Meta<typeof VirtualizedNotificationList> = {
  title: "Notification/VirtualizedList",
  component: VirtualizedNotificationList,
  parameters: {
    layout: "padded"
  }
};

export default meta;

type Story = StoryObj<typeof VirtualizedNotificationList>;

export const OneHundredThousand: Story = {
  name: "100k notifications",
  args: {
    items: makeItems(100_000),
    height: 520,
    itemHeight: 116
  }
};

export const Small: Story = {
  args: {
    items: makeItems(50),
    height: 400,
    itemHeight: 116
  }
};
