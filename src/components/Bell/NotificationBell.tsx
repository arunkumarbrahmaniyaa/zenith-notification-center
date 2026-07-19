import type { ReactNode } from "react";
import { NotificationBadge } from "../Badge/NotificationBadge";

interface NotificationBellProps {
  unreadCount: number;
  onClick?: () => void;
}

export const NotificationBellHeadless = ({
  unreadCount,
  onClick,
  children
}: NotificationBellProps & {
  children: (api: { unreadCount: number; onClick?: () => void }) => ReactNode;
}) => <>{children({ unreadCount, onClick })}</>;

export const NotificationBell = ({ unreadCount, onClick }: NotificationBellProps) => {
  return (
    <button type="button" className="znc-bell" onClick={onClick} aria-label="Open notification center">
      <span aria-hidden>🔔</span>
      {unreadCount > 0 ? <NotificationBadge count={unreadCount} /> : null}
    </button>
  );
};
