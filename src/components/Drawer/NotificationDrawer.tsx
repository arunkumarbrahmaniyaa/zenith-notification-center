import type { ReactNode } from "react";

interface NotificationDrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export const NotificationDrawer = ({ open, onClose, children }: NotificationDrawerProps) => {
  return (
    <div className={`znc-drawer-wrap ${open ? "open" : ""}`} aria-hidden={!open}>
      <button
        type="button"
        className="znc-drawer-backdrop"
        aria-label="Close drawer"
        onClick={onClose}
      />
      <aside className="znc-drawer" aria-label="Notification drawer">
        {children}
      </aside>
    </div>
  );
};
