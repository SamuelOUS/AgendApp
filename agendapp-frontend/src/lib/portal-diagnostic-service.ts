export interface PortalElementSummary {
  tag: string;
  text: string;
  id?: string;
  name?: string;
  type?: string;
  href?: string;
  value?: string;
  placeholder?: string;
  ariaLabel?: string;
  classes?: string;
}

export interface PortalDiagnosticSnapshot {
  url: string;
  title: string;
  headings: PortalElementSummary[];
  buttons: PortalElementSummary[];
  links: PortalElementSummary[];
  selects: PortalElementSummary[];
  inputs: PortalElementSummary[];
  htmlSample: string;
  capturedAt: string;
  artifactPath?: string;
  screenshotPath?: string;
}

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

async function diagnosticRequest(
  sessionId: string,
  path: string,
  method = "GET"
): Promise<PortalDiagnosticSnapshot> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "x-session-id": sessionId,
    },
  });
  const payload = (await response.json().catch(() => null)) as
    | ApiResponse<PortalDiagnosticSnapshot>
    | null;

  if (!response.ok || !payload?.ok || !payload.data) {
    throw new Error(payload?.error ?? "No fue posible inspeccionar el portal.");
  }

  return payload.data;
}

export function inspectPortal(sessionId: string): Promise<PortalDiagnosticSnapshot> {
  return diagnosticRequest(sessionId, "/portal-diagnostics/inspect");
}

export function goToAppointmentsPortal(
  sessionId: string
): Promise<PortalDiagnosticSnapshot> {
  return diagnosticRequest(sessionId, "/portal-diagnostics/go-to-appointments", "POST");
}

export async function selectPortalBeneficiary(
  sessionId: string,
  beneficiaryId: string
): Promise<PortalDiagnosticSnapshot> {
  const response = await fetch(`${API_BASE_URL}/portal-diagnostics/select-beneficiary`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-session-id": sessionId,
    },
    body: JSON.stringify({ beneficiaryId }),
  });
  const payload = (await response.json().catch(() => null)) as
    | ApiResponse<PortalDiagnosticSnapshot>
    | null;

  if (!response.ok || !payload?.ok || !payload.data) {
    throw new Error(payload?.error ?? "No fue posible seleccionar beneficiario.");
  }

  return payload.data;
}

export function acceptPortalRedirect(sessionId: string): Promise<PortalDiagnosticSnapshot> {
  return diagnosticRequest(sessionId, "/portal-diagnostics/accept-redirect", "POST");
}
