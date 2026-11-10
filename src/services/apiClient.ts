const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const TOKEN_KEY = "edustream_token";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let response: Response;

  try {
    const token = localStorage.getItem(TOKEN_KEY);
    response = await fetch(`${API_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    });
  } catch {
    throw new ApiError(
      "No se pudo conectar con la API. Verifica que json-server esté ejecutándose.",
      0,
    );
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event("edustream:unauthorized"));
    }
    const message =
      typeof body?.message === "string"
        ? body.message
        : "La API no pudo completar la operación.";
    throw new ApiError(message, response.status);
  }

  return body as T;
}
