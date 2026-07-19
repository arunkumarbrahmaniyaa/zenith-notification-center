import type { ReactNode } from "react";

interface NotificationPopoverProps {
  open: boolean;
  anchor: ReactNode;
  children: ReactNode;
}

export const NotificationPopover = ({ open, anchor, children }: NotificationPopoverProps) => {
  return (
    <div className="znc-popover-wrap">
      {anchor}
      {open ? <div className="znc-popover">{children}</div> : null}
    </div>
  );
};
