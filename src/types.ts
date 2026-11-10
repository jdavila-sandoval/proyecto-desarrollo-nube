export type UserRole = "Alumno" | "Profesor";

export type AppRole = "alumno" | "docente";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: AppRole;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface NotificationState {
  message: string;
  type: "success" | "error";
}

export interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

export interface RegisterFormData {
  name: string;
  institutionId: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
}

export interface VideoItem {
  id: number | string;
  title: string;
  subject: string;
  code: string;
  duration: string;
  uploadedAt: string;
  views: number;
  thumbnailClass: string;
  unit?: string;
  description?: string;
  visibility?: "campus" | "group";
  progress?: number;
  currentTime?: string;
}

export interface VideoFormData {
  title: string;
  subject: string;
  code: string;
  unit: string;
  description: string;
  visibility: "campus" | "group";
}

export type VideoFieldErrors = Partial<Record<keyof VideoFormData, string>>;

export interface CourseMetric {
  label: string;
  value: string;
  detail: string;
  icon: string;
  tone: "purple" | "orange" | "blue" | "green";
}
