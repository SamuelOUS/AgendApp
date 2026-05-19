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
  sessionId: string;
  beneficiary: Beneficiary;
  appointmentType: AppointmentType;
  date: string;
  time: string;
  timezone: string;
  status: 'active' | 'cancelled';
  createdAt: string;
  cancelledAt?: string;
}

export interface ScheduleAppointmentRequest {
  beneficiaryId: string;
  appointmentTypeId: string;
  date: string;
  time: string;
  timezone: string;
}
