import { NotificationInbox } from "./Inbox/NotificationInbox";

export const NotificationSidebar = () => {
  return (
    <aside className="znc-sidebar" aria-label="Notification sidebar">
      <NotificationInbox />
    </aside>
  );
};
