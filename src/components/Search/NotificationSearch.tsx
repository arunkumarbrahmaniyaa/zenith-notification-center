import type { ReactNode } from "react";

interface NotificationSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const NotificationSearchHeadless = ({
  value,
  onChange,
  children
}: NotificationSearchProps & {
  children: (api: { value: string; onChange: (value: string) => void }) => ReactNode;
}) => <>{children({ value, onChange })}</>;

export const NotificationSearch = ({
  value,
  onChange,
  placeholder = "Search notifications"
}: NotificationSearchProps) => {
  return (
    <label className="znc-search" aria-label="Search notifications">
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
};
