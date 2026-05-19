export interface IntakeRequest {
  name: string;
  epsId?: string;
  documentType?: string;
  documentNumber?: string;
  phone?: string;
  email?: string;
}

export interface IntakeContext extends IntakeRequest {
  intakeId: string;
  createdAt: string;
}
