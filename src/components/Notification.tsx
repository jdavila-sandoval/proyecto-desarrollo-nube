import type { NotificationState } from "../types";

export function Notification({
  notification,
}: {
  notification: NotificationState | null;
}) {
  if (!notification) return null;
  return (
    <div
      className={`notification notification-${notification.type}`}
      role="status"
    >
      <span aria-hidden="true">
        {notification.type === "success" ? "✓" : "!"}
      </span>
      {notification.message}
    </div>
  );
}
