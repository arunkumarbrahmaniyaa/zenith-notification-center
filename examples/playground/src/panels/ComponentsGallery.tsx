import { useState } from "react";
import {
  NotificationCenter,
  NotificationDrawer,
  NotificationSidebar,
  NotificationSettings,
  NotificationSearch,
  NotificationFilters,
  NotificationPopover,
  NotificationModal,
  NotificationList,
  NotificationItem,
  NotificationBell,
  NotificationBadge,
  EmptyState,
  LoadingState,
  useNotifications,
  useNotificationActions,
  useUnreadCount,
  type NotificationTheme
} from "@zenithlogiclabs/react-notification-center";

function Card({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return (
    <section className="panel gallery-card">
      <h3>{title}</h3>
      <p className="status">{note}</p>
      <div className="gallery-demo">{children}</div>
    </section>
  );
}

/**
 * Renders every prebuilt component exported by the library so consumers can see
 * each one wired to the live provider state.
 */
export function ComponentsGallery() {
  const { notifications, searchQuery, search, filters, filter } = useNotifications();
  const { markRead, star, archive } = useNotificationActions();
  const unread = useUnreadCount();

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [settingsMode, setSettingsMode] = useState<NotificationTheme["mode"]>("light");

  const sample = notifications[0];

  return (
    <div className="gallery">
      <Card title="NotificationCenter" note="Self-contained bell + popover inbox.">
        <NotificationCenter />
      </Card>

      <Card title="NotificationDrawer (high-level)" note="Bundled bell that opens its own drawer.">
        <NotificationDrawer />
      </Card>

      <Card title="NotificationBell + NotificationBadge" note="Primitive bell and unread badge.">
        <div className="row">
          <NotificationBell unreadCount={unread} onClick={() => markRead(sample?.id ?? "")} />
          <span className="badge-wrap">
            Unread <NotificationBadge count={unread} />
          </span>
        </div>
      </Card>

      <Card title="NotificationSearch" note="Controlled search input bound to provider state.">
        <NotificationSearch value={searchQuery} onChange={search} />
      </Card>

      <Card title="NotificationFilters" note="Prebuilt filter controls.">
        <NotificationFilters value={filters} onChange={filter} />
      </Card>

      <Card title="NotificationSettings" note="Theme mode selector.">
        <NotificationSettings themeMode={settingsMode} onThemeModeChange={setSettingsMode} />
      </Card>

      <Card title="NotificationPopover" note="Anchored popover primitive.">
        <NotificationPopover
          open={popoverOpen}
          anchor={
            <button onClick={() => setPopoverOpen((value) => !value)}>
              {popoverOpen ? "Hide" : "Show"} popover
            </button>
          }
        >
          <div className="popover-body">Popover content</div>
        </NotificationPopover>
      </Card>

      <Card title="NotificationModal" note="Accessible modal dialog.">
        <button onClick={() => setModalOpen(true)}>Open modal</button>
        <NotificationModal open={modalOpen} onClose={() => setModalOpen(false)} title="Notifications">
          <NotificationList
            items={notifications.slice(0, 4)}
            onRead={markRead}
            onStar={star}
            onArchive={archive}
          />
        </NotificationModal>
      </Card>

      <Card title="NotificationList" note="Static list of notification items.">
        {notifications.length > 0 ? (
          <NotificationList
            items={notifications.slice(0, 5)}
            onRead={markRead}
            onStar={star}
            onArchive={archive}
          />
        ) : (
          <EmptyState title="Nothing here" description="Add a notification to populate the list." />
        )}
      </Card>

      <Card title="NotificationItem" note="A single rendered notification.">
        {sample ? (
          <NotificationItem item={sample} onRead={markRead} onStar={star} onArchive={archive} />
        ) : (
          <EmptyState title="No item" description="No notification available to render." />
        )}
      </Card>

      <Card title="NotificationSidebar" note="Docked sidebar inbox.">
        <NotificationSidebar />
      </Card>

      <Card title="EmptyState" note="Zero-data placeholder.">
        <EmptyState title="All caught up" description="You have no new notifications." />
      </Card>

      <Card title="LoadingState" note="Async loading placeholder.">
        <LoadingState />
      </Card>
    </div>
  );
}
