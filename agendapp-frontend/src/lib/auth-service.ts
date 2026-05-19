export interface AuthRequest {
  epsId: string;
  documentType: string;
  documentNumber: string;
  password: string;
  intakeId?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  sessionId?: string;
  expiresAt?: string;
}

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
  details?: Array<{
    field?: string;
    message: string;
  }>;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

async function readApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!payload) {
    return {
      ok: false,
      error: "Respuesta invalida del servidor.",
    };
  }

  return payload;
}

function getApiErrorMessage(payload: ApiResponse<unknown>): string {
  if (payload.details?.length) {
    return payload.details.map((detail) => detail.message).join(". ");
  }

  return payload.error ?? "No fue posible completar la solicitud.";
}

export async function authenticateWithEPS(
  request: AuthRequest
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });
  const payload = await readApiResponse<AuthResponse>(response);

  if (response.ok && payload.ok && payload.data) {
    return {
      success: payload.data.success,
      message: payload.data.message,
      sessionId: payload.data.sessionId,
      expiresAt: payload.data.expiresAt,
    };
  }

  return {
    success: false,
    message: getApiErrorMessage(payload),
  };
}

export async function logoutFromEPS(sessionId: string): Promise<void> {
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    headers: {
      "x-session-id": sessionId,
    },
  });
}
