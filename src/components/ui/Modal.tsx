import type { ReactNode } from "react";

interface ModalProps {
  title: string;
  description: string;
  children?: ReactNode;
  onClose: () => void;
}

export function Modal({ title, description, children, onClose }: ModalProps) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Cerrar modal"
        >
          ×
        </button>
        <div className="modal-icon">!</div>
        <h2 id="modal-title">{title}</h2>
        <p>{description}</p>
        {children}
      </section>
    </div>
  );
}
