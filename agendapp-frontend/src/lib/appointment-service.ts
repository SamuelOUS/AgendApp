export interface Beneficiary {
  id: string;
  name: string;
  relationship: string;
  documentType?: string;
  documentNumber?: string;
  birthDate?: string;
}

export interface AppointmentType {
  id: string;
  name: string;
  specialty: string;
}

export interface AppointmentSlot {
  slotId: string;
  date: string;
  time: string;
  timezone: string;
  label: string;
}

export interface MedicalAppointment {
  appointmentId: string;
  beneficiary: Beneficiary;
  appointmentType: AppointmentType;
  date: string;
  time: string;
  timezone: string;
  status: "active" | "cancelled";
  createdAt: string;
  cancelledAt?: string;
}

export interface AppointmentContext {
  beneficiaries: Beneficiary[];
  appointmentTypes: AppointmentType[];
  timezone: string;
  rescheduleUrl: string;
}

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

async function requestApi<T>(
  path: string,
  sessionId: string,
  init: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-session-id": sessionId,
      ...init.headers,
    },
  });
  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !payload?.ok || !payload.data) {
    throw new Error(payload?.error ?? "No fue posible completar la solicitud.");
  }

  return payload.data;
}

export function getAppointmentContext(sessionId: string): Promise<AppointmentContext> {
  return requestApi<AppointmentContext>("/appointments/context", sessionId);
}

export async function getAvailability(
  sessionId: string,
  date: string,
  timezone: string
): Promise<AppointmentSlot[]> {
  const params = new URLSearchParams({ date, timezone });
  const data = await requestApi<{ slots: AppointmentSlot[] }>(
    `/appointments/availability?${params.toString()}`,
    sessionId
  );

  return data.slots;
}

export function scheduleAppointment(
  sessionId: string,
  body: {
    beneficiaryId: string;
    appointmentTypeId: string;
    date: string;
    time: string;
    timezone: string;
  }
): Promise<MedicalAppointment> {
  return requestApi<MedicalAppointment>("/appointments/schedule", sessionId, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getActiveAppointments(
  sessionId: string
): Promise<MedicalAppointment[]> {
  const data = await requestApi<{ appointments: MedicalAppointment[] }>(
    "/appointments/active",
    sessionId
  );

  return data.appointments;
}

export async function getAppointmentHistory(
  sessionId: string
): Promise<MedicalAppointment[]> {
  const data = await requestApi<{ appointments: MedicalAppointment[] }>(
    "/appointments/history",
    sessionId
  );

  return data.appointments;
}

export function cancelAppointment(
  sessionId: string,
  appointmentId: string
): Promise<MedicalAppointment> {
  return requestApi<MedicalAppointment>(
    `/appointments/${appointmentId}/cancel`,
    sessionId,
    { method: "POST" }
  );
}

export function rescheduleAppointment(
  sessionId: string,
  appointmentId: string,
  body: {
    date: string;
    time: string;
    timezone: string;
  }
): Promise<MedicalAppointment> {
  return requestApi<MedicalAppointment>(
    `/appointments/${appointmentId}/reschedule`,
    sessionId,
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );
}

export function cancelAppointmentFlow(sessionId: string): Promise<{ message: string }> {
  return requestApi<{ message: string }>("/appointments/cancel-flow", sessionId, {
    method: "POST",
  });
}
