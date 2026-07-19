import type { ReactNode } from "react";
import type { NotificationItem as NotificationItemType } from "../../types";
import { relativeTime } from "../../utils/time";

interface NotificationItemProps {
  item: NotificationItemType;
  onRead?: (id: string) => void;
  onArchive?: (id: string) => void;
  onStar?: (id: string) => void;
}

export const NotificationItemHeadless = ({
  item,
  children
}: NotificationItemProps & { children: (item: NotificationItemType) => ReactNode }) => {
  return <>{children(item)}</>;
};

export const NotificationItem = ({ item, onRead, onArchive, onStar }: NotificationItemProps) => {
  return (
    <article className={`znc-item ${item.read ? "znc-item-read" : ""}`} aria-live="polite">
      <header className="znc-item-header">
        <div>
          <h4>{item.title}</h4>
          <p>{item.message}</p>
        </div>
        <time dateTime={item.createdAt}>{relativeTime(item.timestamp)}</time>
      </header>
      {item.description ? <p className="znc-item-description">{item.description}</p> : null}
      <footer className="znc-item-actions">
        <button type="button" onClick={() => onRead?.(item.id)}>
          {item.read ? "Mark unread" : "Mark read"}
        </button>
        <button type="button" onClick={() => onStar?.(item.id)}>
          {item.starred ? "Unstar" : "Star"}
        </button>
        <button type="button" onClick={() => onArchive?.(item.id)}>
          Archive
        </button>
      </footer>
    </article>
  );
};
