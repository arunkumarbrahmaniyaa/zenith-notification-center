import { useToast } from "../../hooks/useToast";

interface ToastContainerProps {
  position?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "top-center"
    | "bottom-center";
}

export const ToastContainer = ({ position = "top-right" }: ToastContainerProps) => {
  const { toasts, toast } = useToast();

  return (
    <aside className={`znc-toast znc-${position}`} role="status" aria-live="polite">
      {toasts.map((item) => (
        <article key={item.id} className={`znc-toast-item znc-toast-${item.type}`}>
          <div>
            <h5>{item.title}</h5>
            {item.message ? <p>{item.message}</p> : null}
          </div>
          <button type="button" onClick={() => toast.dismiss(item.id)} aria-label="Dismiss toast">
            ×
          </button>
        </article>
      ))}
    </aside>
  );
};
