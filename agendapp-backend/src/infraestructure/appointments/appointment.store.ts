import { v4 as uuidv4 } from 'uuid';
import {
  AppointmentSlot,
  AppointmentType,
  Beneficiary,
  MedicalAppointment,
  RescheduleAppointmentRequest,
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

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map((value) => Number(value));
  return hours * 60 + minutes;
}

function getZonedNow(timezone: string): { date: string; time: string } {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(new Date());
    const lookup = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((part) => part.type === type)?.value ?? '';

    const date = `${lookup('year')}-${lookup('month')}-${lookup('day')}`;
    const time = `${lookup('hour')}:${lookup('minute')}`;

    if (date.includes('undefined') || time.includes('undefined')) {
      throw new Error('Formato de fecha invalido');
    }

    return { date, time };
  } catch {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return { date: `${year}-${month}-${day}`, time: `${hours}:${minutes}` };
  }
}

function isDateTodayOrPast(date: string, timezone: string): boolean {
  const now = getZonedNow(timezone);
  return date <= now.date;
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
    const slots = buildSlots(date, timezone);
    if (isDateTodayOrPast(date, timezone)) {
      return [];
    }

    return slots;
  },

  isDateTodayOrPast(date: string, timezone: string): boolean {
    return isDateTodayOrPast(date, timezone);
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

    if (isDateTodayOrPast(request.date, request.timezone)) {
      throw new Error('Solo se permiten citas desde el dia siguiente.');
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

  reschedule(
    sessionId: string,
    appointmentId: string,
    request: RescheduleAppointmentRequest,
  ): MedicalAppointment {
    const appointments = appointmentsBySession.get(sessionId) ?? [];
    const appointment = appointments.find((item) => item.appointmentId === appointmentId);

    if (!appointment) {
      throw new Error('Cita no encontrada');
    }

    if (appointment.status !== 'active') {
      throw new Error('No se puede reprogramar una cita cancelada');
    }

    if (isDateTodayOrPast(request.date, request.timezone)) {
      throw new Error('Solo se permiten citas desde el dia siguiente.');
    }

    const slotTaken = appointments.some(
      (item) =>
        item.status === 'active' &&
        item.appointmentId !== appointmentId &&
        item.date === request.date &&
        item.time === request.time,
    );

    if (slotTaken) {
      throw new Error('El horario ya fue tomado. Selecciona otro horario.');
    }

    appointment.date = request.date;
    appointment.time = request.time;
    appointment.timezone = request.timezone;

    return appointment;
  },
};
