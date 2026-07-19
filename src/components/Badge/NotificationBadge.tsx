interface NotificationBadgeProps {
  count: number;
  max?: number;
  label?: string;
}

export const NotificationBadge = ({ count, max = 999, label = "Unread notifications" }: NotificationBadgeProps) => {
  const value = count > max ? `${max}+` : String(count);
  return (
    <span className="znc-badge" aria-label={label}>
      {value}
    </span>
  );
};
