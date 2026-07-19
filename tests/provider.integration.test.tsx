import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NotificationProvider } from "../src/providers/NotificationProvider";
import { useNotificationActions } from "../src/hooks/useNotificationActions";
import { useUnreadCount } from "../src/hooks/useUnreadCount";

const Harness = () => {
  const { addNotification, markAllRead } = useNotificationActions();
  const unread = useUnreadCount();

  return (
    <div>
      <button
        type="button"
        onClick={() =>
          addNotification({
            title: "Build success",
            message: "Pipeline finished",
            category: "ci",
            type: "success",
            priority: "high"
          })
        }
      >
        Add
      </button>
      <button type="button" onClick={markAllRead}>
        Mark All
      </button>
      <span data-testid="unread">{unread}</span>
    </div>
  );
};

describe("NotificationProvider integration", () => {
  it("tracks unread count", async () => {
    await act(async () => {
      render(
        <NotificationProvider>
          <Harness />
        </NotificationProvider>
      );
    });

    expect(screen.getByTestId("unread")).toHaveTextContent("0");

    act(() => {
      screen.getByText("Add").click();
    });

    expect(screen.getByTestId("unread")).toHaveTextContent("1");

    act(() => {
      screen.getByText("Mark All").click();
    });

    expect(screen.getByTestId("unread")).toHaveTextContent("0");
  });
});
