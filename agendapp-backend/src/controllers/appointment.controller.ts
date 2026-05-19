import { Request, Response } from 'express';
import { appointmentStore } from '../infraestructure/appointments/appointment.store.js';
import {
  clearAppointmentReminders,
  scheduleAppointmentReminders,
} from '../infraestructure/appointments/appointment-reminder.service.js';
import { intakeStore } from '../infraestructure/intake/intake.store.js';
import { readPortalBeneficiaries } from '../infraestructure/browser/portal-appointments.service.js';
import {
  sendAppointmentCancellation,
  sendAppointmentConfirmation,
} from '../infraestructure/email/email.service.js';
import { RescheduleAppointmentRequest, ScheduleAppointmentRequest } from '../types/index.types';
import { logger } from '../utils/logger.js';

async function getBeneficiaries(req: Request) {
  const portalBeneficiaries = await readPortalBeneficiaries(req.activeSession!.page).catch(() => []);

  if (portalBeneficiaries.length > 0) {
    return portalBeneficiaries;
  }

  const intake = req.activeSession?.intakeId
    ? intakeStore.get(req.activeSession.intakeId)
    : undefined;

  return appointmentStore.buildBeneficiaries(intake?.name);
}

export async function appointmentContextHandler(req: Request, res: Response): Promise<void> {
  res.status(200).json({
    ok: true,
    data: {
      beneficiaries: await getBeneficiaries(req),
      appointmentTypes: appointmentStore.listAppointmentTypes(),
      timezone: 'America/Bogota',
      rescheduleUrl: 'https://portaleps.epssura.com/ServiciosUnClick/#/',
    },
  });
}

export function availabilityHandler(req: Request, res: Response): void {
  const date = String(req.query.date ?? '');
  const timezone = String(req.query.timezone ?? 'America/Bogota');

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    res.status(422).json({
      ok: false,
      error: 'Fecha invalida. Usa formato YYYY-MM-DD',
    });
    return;
  }

  if (appointmentStore.isDateTodayOrPast(date, timezone)) {
    res.status(422).json({
      ok: false,
      error: 'Solo se permiten citas desde el dia siguiente.',
    });
    return;
  }

  res.status(200).json({
    ok: true,
    data: {
      slots: appointmentStore.listAvailability(date, timezone),
    },
  });
}

export async function scheduleAppointmentHandler(req: Request, res: Response): Promise<void> {
  try {
    const appointment = appointmentStore.create(
      req.activeSession!.sessionId,
      await getBeneficiaries(req),
      req.body as ScheduleAppointmentRequest,
    );

    const intake = req.activeSession?.intakeId
      ? intakeStore.get(req.activeSession.intakeId)
      : undefined;
    const recipientEmail = intake?.email ?? req.activeSession?.email;

    if (recipientEmail) {
      const sent = await sendAppointmentConfirmation({
        to: recipientEmail,
        appointment,
        recipientName: intake?.name,
      });

      if (sent) {
        logger.info('[Appointment] Correo de confirmacion enviado', {
          appointmentId: appointment.appointmentId,
          email: recipientEmail,
        });
      } else {
        logger.warn('[Appointment] No se pudo enviar correo de confirmacion', {
          appointmentId: appointment.appointmentId,
          email: recipientEmail,
        });
      }
    } else {
      logger.info('[Appointment] Sin correo registrado para enviar confirmacion', {
        appointmentId: appointment.appointmentId,
      });
    }

    scheduleAppointmentReminders({
      appointment,
      recipientEmail,
      recipientName: intake?.name,
    });

    res.status(201).json({
      ok: true,
      data: appointment,
    });
  } catch (err) {
    res.status(409).json({
      ok: false,
      error: err instanceof Error ? err.message : 'No fue posible agendar la cita',
    });
  }
}

export function activeAppointmentsHandler(req: Request, res: Response): void {
  res.status(200).json({
    ok: true,
    data: {
      appointments: appointmentStore.listActive(req.activeSession!.sessionId),
    },
  });
}

export function appointmentHistoryHandler(req: Request, res: Response): void {
  res.status(200).json({
    ok: true,
    data: {
      appointments: appointmentStore.listHistory(req.activeSession!.sessionId),
    },
  });
}

export async function cancelAppointmentHandler(req: Request, res: Response): Promise<void> {
  try {
    const appointment = appointmentStore.cancel(
      req.activeSession!.sessionId,
      req.params.appointmentId,
    );

    clearAppointmentReminders(appointment.appointmentId);

    const intake = req.activeSession?.intakeId
      ? intakeStore.get(req.activeSession.intakeId)
      : undefined;
    const recipientEmail = intake?.email ?? req.activeSession?.email;

    if (recipientEmail) {
      const sent = await sendAppointmentCancellation({
        to: recipientEmail,
        appointment,
        recipientName: intake?.name,
      });

      if (sent) {
        logger.info('[Appointment] Correo de cancelacion enviado', {
          appointmentId: appointment.appointmentId,
          email: recipientEmail,
        });
      } else {
        logger.warn('[Appointment] No se pudo enviar correo de cancelacion', {
          appointmentId: appointment.appointmentId,
          email: recipientEmail,
        });
      }
    } else {
      logger.info('[Appointment] Sin correo registrado para enviar cancelacion', {
        appointmentId: appointment.appointmentId,
      });
    }

    res.status(200).json({
      ok: true,
      data: appointment,
    });
  } catch (err) {
    res.status(404).json({
      ok: false,
      error: err instanceof Error ? err.message : 'No fue posible cancelar la cita',
    });
  }
}

export function rescheduleAppointmentHandler(req: Request, res: Response): void {
  try {
    const appointment = appointmentStore.reschedule(
      req.activeSession!.sessionId,
      req.params.appointmentId,
      req.body as RescheduleAppointmentRequest,
    );

    const intake = req.activeSession?.intakeId
      ? intakeStore.get(req.activeSession.intakeId)
      : undefined;
    const recipientEmail = intake?.email ?? req.activeSession?.email;

    scheduleAppointmentReminders({
      appointment,
      recipientEmail,
      recipientName: intake?.name,
    });

    res.status(200).json({
      ok: true,
      data: appointment,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'No fue posible reprogramar la cita';
    const status = message.toLowerCase().includes('no encontrada') ? 404 : 409;
    res.status(status).json({
      ok: false,
      error: message,
    });
  }
}

export function cancelFlowHandler(_req: Request, res: Response): void {
  res.status(200).json({
    ok: true,
    data: {
      message: 'Proceso de agendamiento cancelado',
    },
  });
}
