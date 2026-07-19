import { useState } from "react";
import type { NotificationGroup as NotificationGroupType } from "../types";
import { NotificationList } from "./NotificationList/NotificationList";

interface NotificationGroupProps {
  group: NotificationGroupType;
  initiallyCollapsed?: boolean;
}

export const NotificationGroup = ({
  group,
  initiallyCollapsed = false
}: NotificationGroupProps) => {
  const [collapsed, setCollapsed] = useState(initiallyCollapsed);

  return (
    <section className="znc-group" aria-label={`Group ${group.title}`}>
      <button
        type="button"
        className="znc-group-header"
        onClick={() => setCollapsed((value) => !value)}
        aria-expanded={!collapsed}
      >
        <span>{group.title}</span>
        <span>{group.unreadCount} unread</span>
      </button>
      {collapsed ? null : <NotificationList items={group.notifications} />}
    </section>
  );
};
