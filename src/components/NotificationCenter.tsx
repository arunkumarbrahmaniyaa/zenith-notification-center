import { useState } from "react";
import { useUnreadCount } from "../hooks/useUnreadCount";
import { NotificationBell } from "./Bell/NotificationBell";
import { NotificationInbox } from "./Inbox/NotificationInbox";
import { NotificationPopover } from "./Popover/NotificationPopover";

export const NotificationCenter = () => {
  const [open, setOpen] = useState(false);
  const unreadCount = useUnreadCount();

  return (
    <NotificationPopover
      open={open}
      anchor={<NotificationBell unreadCount={unreadCount} onClick={() => setOpen((value) => !value)} />}
    >
      <NotificationInbox />
    </NotificationPopover>
  );
};
