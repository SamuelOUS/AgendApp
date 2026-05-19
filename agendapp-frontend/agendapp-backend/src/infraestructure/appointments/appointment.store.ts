import { v4 as uuidv4 } from 'uuid';
import {
  AppointmentSlot,
  AppointmentType,
  Beneficiary,
  MedicalAppointment,
  ScheduleAppointmentRequest,
} from '../../types/index.types';

const appointmentTypes: AppointmentType[] = [
  { id: 'medicina-general', name: 'Medicina general', specialty: 'Medicina general' },
  { id: 'odontologia', name: 'Odontologia', specialty: 'Odontologia' },
  { id: 'enfermeria', name: 'Enfermeria', specialty: 'Enfermeria' },
  { id: 'laboratorio', name: 'Laboratorio clinico', specialty: 'Laboratorio clinico' },
];

const appointmentsBySession = new Map<string, MedicalAppointment[]>();

function buildSlots(date: string, timezone: string): AppointmentSlot[] {
  return ['07:40', '08:20', '09:10', '10:30', '14:00', '15:20'].map((time) => ({
    slotId: `${date}-${time}`,
    date,
    time,
    timezone,
    label: `${date} ${time} (${timezone})`,
  }));
}

export const appointmentStore = {
  listAppointmentTypes(): AppointmentType[] {
    return appointmentTypes;
  },

  buildBeneficiaries(name?: string): Beneficiary[] {
    return [
      {
        id: 'titular',
        name: name?.trim() || 'Titular',
        relationship: 'Titular',
      },
    ];
  },

  listAvailability(date: string, timezone: string): AppointmentSlot[] {
    return buildSlots(date, timezone);
  },

  create(
    sessionId: string,
    beneficiaries: Beneficiary[],
    request: ScheduleAppointmentRequest,
  ): MedicalAppointment {
    const beneficiary = beneficiaries.find((item) => item.id === request.beneficiaryId);
    const appointmentType = appointmentTypes.find((item) => item.id === request.appointmentTypeId);

    if (!beneficiary) {
      throw new Error('Beneficiario no encontrado');
    }

    if (!appointmentType) {
      throw new Error('Tipo de cita no encontrado');
    }

    const existingAppointments = appointmentsBySession.get(sessionId) ?? [];
    const slotTaken = existingAppointments.some(
      (appointment) =>
        appointment.status === 'active' &&
        appointment.date === request.date &&
        appointment.time === request.time,
    );

    if (slotTaken) {
      throw new Error('El horario ya fue tomado. Selecciona otro horario.');
    }

    const appointment: MedicalAppointment = {
      appointmentId: uuidv4(),
      sessionId,
      beneficiary,
      appointmentType,
      date: request.date,
      time: request.time,
      timezone: request.timezone,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    appointmentsBySession.set(sessionId, [...existingAppointments, appointment]);
    return appointment;
  },

  listActive(sessionId: string): MedicalAppointment[] {
    return (appointmentsBySession.get(sessionId) ?? []).filter(
      (appointment) => appointment.status === 'active',
    );
  },

  listHistory(sessionId: string): MedicalAppointment[] {
    return appointmentsBySession.get(sessionId) ?? [];
  },

  cancel(sessionId: string, appointmentId: string): MedicalAppointment {
    const appointment = (appointmentsBySession.get(sessionId) ?? []).find(
      (item) => item.appointmentId === appointmentId,
    );

    if (!appointment) {
      throw new Error('Cita no encontrada');
    }

    if (appointment.status === 'cancelled') {
      return appointment;
    }

    appointment.status = 'cancelled';
    appointment.cancelledAt = new Date().toISOString();
    return appointment;
  },
};
