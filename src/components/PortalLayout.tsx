import type { ReactNode } from "react";
import { useState } from "react";
import { PortalNavbar } from "./PortalNavbar";

export function PortalLayout({
  children,
  role,
  onRoleChange,
}: {
  children: ReactNode;
  role: "Alumno" | "Docente";
  onRoleChange: (role: "Alumno" | "Docente") => void;
}) {
  return (
    <>
      <PortalNavbar role={role} onRoleChange={onRoleChange} />
      <main className="portal-main">{children}</main>
    </>
  );
}

export function usePortalRole() {
  return useState<"Alumno" | "Docente">("Alumno");
}
