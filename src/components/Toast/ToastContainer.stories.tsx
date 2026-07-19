import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { NotificationProvider } from "../../providers/NotificationProvider";
import { useToast } from "../../hooks/useToast";
import { ToastContainer } from "./ToastContainer";

const Demo = () => {
  const { toast } = useToast();
  const [count, setCount] = useState(0);

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setCount((v) => v + 1);
          toast.show({ title: `Notification ${count + 1}`, message: "An example toast", type: "info" });
        }}
      >
        Show Toast
      </button>
      <ToastContainer />
    </div>
  );
};

const meta: Meta<typeof ToastContainer> = {
  title: "Notification/Toast",
  component: ToastContainer,
  decorators: [
    (Story) => (
      <NotificationProvider>
        <Story />
      </NotificationProvider>
    )
  ]
};

export default meta;

type Story = StoryObj<typeof ToastContainer>;

export const Playground: Story = {
  render: () => <Demo />
};
