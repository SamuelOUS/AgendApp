export const DOCUMENT_TYPES = ['C', 'T', 'P', 'E', 'R'] as const;
export type DocumentType = typeof DOCUMENT_TYPES[number];

export interface LoginCredentials {
  epsId: string;
  documentType: DocumentType;
  documentNumber: string;
  password: string;
  intakeId?: string;
}

//Resultado de la autenticacion : respuesta
export interface LoginResult {
  success: boolean;
  sessionId?: string;
  message: string;
  expiresAt?: string;
  intakeId?: string;
}
