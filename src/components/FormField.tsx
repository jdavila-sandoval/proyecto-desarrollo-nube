import type { InputHTMLAttributes, ReactNode } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  children?: ReactNode;
}

export function FormField({ label, id, children, ...props }: FormFieldProps) {
  return (
    <label className="form-field" htmlFor={id}>
      <span>{label}</span>
      <div className="input-wrap">
        <input id={id} {...props} />
        {children}
      </div>
    </label>
  );
}
