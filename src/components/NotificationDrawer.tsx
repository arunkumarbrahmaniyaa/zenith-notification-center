import { useState } from "react";
import { useUnreadCount } from "../hooks/useUnreadCount";
import { NotificationBell } from "./Bell/NotificationBell";
import { NotificationDrawer as Drawer } from "./Drawer/NotificationDrawer";
import { NotificationInbox } from "./Inbox/NotificationInbox";

export const NotificationDrawer = () => {
  const [open, setOpen] = useState(false);
  const unread = useUnreadCount();

  return (
    <>
      <NotificationBell unreadCount={unread} onClick={() => setOpen(true)} />
      <Drawer open={open} onClose={() => setOpen(false)}>
        <NotificationInbox />
      </Drawer>
    </>
  );
};
