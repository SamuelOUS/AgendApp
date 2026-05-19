export interface IntakeContext {
  intakeId: string;
  name: string;
  epsId?: string;
  documentType?: string;
  documentNumber?: string;
  phone?: string;
  email?: string;
  createdAt: string;
}

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export async function getIntake(intakeId: string): Promise<IntakeContext | null> {
  const response = await fetch(`${API_BASE_URL}/intake/${intakeId}`);
  const payload = (await response.json().catch(() => null)) as ApiResponse<IntakeContext> | null;

  if (!response.ok || !payload?.ok || !payload.data) {
    return null;
  }

  return payload.data;
}
