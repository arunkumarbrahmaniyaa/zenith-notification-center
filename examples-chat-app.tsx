import { NotificationProvider, NotificationCenter, ToastContainer, useNotificationActions } from "@zenithlogiclabs/react-notification-center";

const ChatActions = () => {
  const { addNotification } = useNotificationActions();

  return (
    <button
      type="button"
      onClick={() =>
        addNotification({
          title: "New Mention",
          message: "Akhil mentioned you in #engineering",
          category: "chat",
          type: "mention",
          priority: "high",
          sender: { id: "u1", name: "Akhil" },
          tags: ["chat", "mention"]
        })
      }
    >
      Simulate Mention
    </button>
  );
};

export const ChatExample = () => {
  return (
    <NotificationProvider>
      <NotificationCenter />
      <ToastContainer />
      <ChatActions />
    </NotificationProvider>
  );
};
