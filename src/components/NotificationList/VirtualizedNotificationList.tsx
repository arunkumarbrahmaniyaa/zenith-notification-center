import { useVirtualizer } from "../../hooks/useVirtualizer";
import type { NotificationItem as NotificationItemType } from "../../types";
import { NotificationItem } from "../NotificationItem/NotificationItem";

interface VirtualizedNotificationListProps {
  items: NotificationItemType[];
  height?: number;
  itemHeight?: number;
  onRead?: (id: string) => void;
  onArchive?: (id: string) => void;
  onStar?: (id: string) => void;
}

/**
 * Windowed notification list capable of rendering very large datasets
 * (100k+ items) by only mounting the visible rows.
 */
export const VirtualizedNotificationList = ({
  items,
  height = 480,
  itemHeight = 116,
  onRead,
  onArchive,
  onStar
}: VirtualizedNotificationListProps) => {
  const { virtualItems, totalHeight, scrollRef } = useVirtualizer({
    count: items.length,
    estimateItemHeight: itemHeight
  });

  return (
    <div
      ref={scrollRef}
      className="znc-virtual"
      style={{ height, overflow: "auto", position: "relative" }}
      aria-label="Virtualized notifications list"
      role="list"
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        {virtualItems.map((virtualItem) => {
          const item = items[virtualItem.index];
          if (!item) return null;

          return (
            <div
              key={item.id}
              role="listitem"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualItem.start}px)`,
                height: virtualItem.size,
                padding: "0 10px",
                boxSizing: "border-box"
              }}
            >
              <NotificationItem item={item} onRead={onRead} onArchive={onArchive} onStar={onStar} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
