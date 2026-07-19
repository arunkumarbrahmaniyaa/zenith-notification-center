import type { ReactNode } from "react";

interface NotificationModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export const NotificationModal = ({ open, onClose, title = "Notifications", children }: NotificationModalProps) => {
  if (!open) return null;

  return (
    <div className="znc-overlay" role="presentation" onClick={onClose}>
      <div
        className="znc-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <header>
          <h3>{title}</h3>
          <button type="button" onClick={onClose} aria-label="Close notifications">
            ×
          </button>
        </header>
        {children}
      </div>
    </div>
  );
};
