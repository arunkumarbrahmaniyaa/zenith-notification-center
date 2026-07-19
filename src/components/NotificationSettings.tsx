import type { NotificationTheme } from "../types";

interface NotificationSettingsProps {
  themeMode: NotificationTheme["mode"];
  onThemeModeChange: (mode: NotificationTheme["mode"]) => void;
}

export const NotificationSettings = ({
  themeMode,
  onThemeModeChange
}: NotificationSettingsProps) => {
  return (
    <section className="znc-settings" aria-label="Notification settings">
      <h4>Settings</h4>
      <label>
        Theme
        <select
          value={themeMode}
          onChange={(event) =>
            onThemeModeChange(event.target.value as NotificationTheme["mode"])
          }
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="auto">Auto</option>
        </select>
      </label>
    </section>
  );
};
