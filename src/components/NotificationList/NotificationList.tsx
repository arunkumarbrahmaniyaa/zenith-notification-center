import type { ReactNode } from "react";
import type { NotificationItem as NotificationItemType } from "../../types";
import { NotificationItem } from "../NotificationItem/NotificationItem";

interface NotificationListProps {
  items: NotificationItemType[];
  onRead?: (id: string) => void;
  onArchive?: (id: string) => void;
  onStar?: (id: string) => void;
}

export const NotificationListHeadless = ({
  items,
  children
}: {
  items: NotificationItemType[];
  children: (items: NotificationItemType[]) => ReactNode;
}) => <>{children(items)}</>;

export const NotificationList = ({ items, onRead, onArchive, onStar }: NotificationListProps) => {
  return (
    <section className="znc-list" aria-label="Notifications list">
      {items.map((item) => (
        <NotificationItem key={item.id} item={item} onRead={onRead} onArchive={onArchive} onStar={onStar} />
      ))}
    </section>
  );
};
