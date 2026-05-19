import type { MedicalAppointment } from '../../types/index.types.js';
import { sendAppointmentReminder } from '../email/email.service.js';
import { config } from '../../utils/config.js';
import { logger } from '../../utils/logger.js';

const MAX_TIMEOUT_MS = 2_147_483_647;

type ReminderType = '24h' | '1h' | 'dev-1m';

const remindersByAppointment = new Map<string, NodeJS.Timeout[]>();

function getTimeZoneOffsetMinutes(date: Date, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'shortOffset',
  });

  const parts = formatter.formatToParts(date);
  const tzName = parts.find((part) => part.type === 'timeZoneName')?.value ?? 'GMT';
  const match = /GMT([+-])(\d{1,2})(?::(\d{2}))?/.exec(tzName);

  if (!match) return 0;

  const sign = match[1] === '-' ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = Number(match[3] ?? '0');
  return sign * (hours * 60 + minutes);
}

function toUtcTimestamp(date: string, time: string, timeZone: string): number {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  const utcGuess = Date.UTC(year, month - 1, day, hours, minutes, 0);
  const offset = getTimeZoneOffsetMinutes(new Date(utcGuess), timeZone);
  let utcTimestamp = utcGuess - offset * 60 * 1000;
  const offsetCheck = getTimeZoneOffsetMinutes(new Date(utcTimestamp), timeZone);

  if (offsetCheck !== offset) {
    utcTimestamp = utcGuess - offsetCheck * 60 * 1000;
  }

  return utcTimestamp;
}

function storeReminder(appointmentId: string, timeout: NodeJS.Timeout) {
  const existing = remindersByAppointment.get(appointmentId) ?? [];
  remindersByAppointment.set(appointmentId, [...existing, timeout]);
}

function scheduleReminder(params: {
  appointment: MedicalAppointment;
  recipientEmail: string;
  recipientName?: string;
  reminderType: ReminderType;
  sendAtMs: number;
}) {
  const { appointment, recipientEmail, recipientName, reminderType, sendAtMs } = params;
  const delayMs = sendAtMs - Date.now();

  if (delayMs <= 0) {
    logger.info('[Reminder] Recordatorio omitido por fecha pasada', {
      appointmentId: appointment.appointmentId,
      reminderType,
    });
    return;
  }

  if (delayMs > MAX_TIMEOUT_MS) {
    logger.warn('[Reminder] Recordatorio demasiado lejano para programar', {
      appointmentId: appointment.appointmentId,
      reminderType,
    });
    return;
  }

  const timeout = setTimeout(async () => {
    const sent = await sendAppointmentReminder({
      to: recipientEmail,
      appointment,
      recipientName,
      reminderType,
    });

    if (sent) {
      logger.info('[Reminder] Recordatorio enviado', {
        appointmentId: appointment.appointmentId,
        reminderType,
        email: recipientEmail,
      });
    } else {
      logger.warn('[Reminder] No se pudo enviar recordatorio', {
        appointmentId: appointment.appointmentId,
        reminderType,
        email: recipientEmail,
      });
    }
  }, delayMs);

  storeReminder(appointment.appointmentId, timeout);
}

export function scheduleAppointmentReminders(params: {
  appointment: MedicalAppointment;
  recipientEmail?: string;
  recipientName?: string;
}): void {
  const { appointment, recipientEmail, recipientName } = params;

  clearAppointmentReminders(appointment.appointmentId);

  if (!recipientEmail) {
    logger.info('[Reminder] Sin correo para programar recordatorios', {
      appointmentId: appointment.appointmentId,
    });
    return;
  }

  const appointmentAt = toUtcTimestamp(
    appointment.date,
    appointment.time,
    appointment.timezone,
  );

  scheduleReminder({
    appointment,
    recipientEmail,
    recipientName,
    reminderType: '24h',
    sendAtMs: appointmentAt - 24 * 60 * 60 * 1000,
  });

  scheduleReminder({
    appointment,
    recipientEmail,
    recipientName,
    reminderType: '1h',
    sendAtMs: appointmentAt - 60 * 60 * 1000,
  });

  if (config.nodeEnv !== 'production') {
    scheduleReminder({
      appointment,
      recipientEmail,
      recipientName,
      reminderType: 'dev-1m',
      sendAtMs: Date.now() + 60 * 1000,
    });
  }
}

export function clearAppointmentReminders(appointmentId: string): void {
  const timers = remindersByAppointment.get(appointmentId);

  if (!timers?.length) return;

  timers.forEach((timer) => clearTimeout(timer));
  remindersByAppointment.delete(appointmentId);

  logger.info('[Reminder] Recordatorios cancelados', { appointmentId });
}
