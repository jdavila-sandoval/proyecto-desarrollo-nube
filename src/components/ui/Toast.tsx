export function Toast({
  message,
  type = "success",
}: {
  message: string | null;
  type?: "success" | "error";
}) {
  if (!message) return null;
  return (
    <div className={`portal-toast portal-toast-${type}`} role="status">
      <span>{type === "success" ? "✓" : "!"}</span>
      {message}
    </div>
  );
}
