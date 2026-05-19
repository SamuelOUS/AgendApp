import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { config } from '../../utils/config.js';
import { logger } from '../../utils/logger.js';
import type { MedicalAppointment } from '../../types/index.types.js';

let cachedTransporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo> | null = null;

function buildTransporter(): nodemailer.Transporter<SMTPTransport.SentMessageInfo> | null {
  const email = config.email;

  if (!email.host || !email.fromEmail) {
    return null;
  }

  const transportOptions: SMTPTransport.Options = {
    host: email.host,
    port: email.port,
    secure: email.secure,
  };

  if (email.user && email.pass) {
    transportOptions.auth = {
      user: email.user,
      pass: email.pass,
    };
  }

  return nodemailer.createTransport(transportOptions);
}

function getTransporter(): nodemailer.Transporter<SMTPTransport.SentMessageInfo> | null {
  if (cachedTransporter) return cachedTransporter;

  cachedTransporter = buildTransporter();
  return cachedTransporter;
}

function buildConfirmationSubject(appointment: MedicalAppointment): string {
  return `Confirmacion de cita - ${appointment.appointmentType.name}`;
}

function buildCancellationSubject(appointment: MedicalAppointment): string {
  return `Cancelacion de cita - ${appointment.appointmentType.name}`;
}

function buildReminderSubject(appointment: MedicalAppointment, label: string): string {
  return `Recordatorio de cita (${label}) - ${appointment.appointmentType.name}`;
}

function buildConfirmationTextBody(params: {
  appointment: MedicalAppointment;
  recipientName?: string;
}): string {
  const { appointment, recipientName } = params;
  const greeting = recipientName ? `Hola ${recipientName},` : 'Hola,';

  return [
    greeting,
    '',
    'Tu cita fue programada correctamente.',
    '',
    `Tipo: ${appointment.appointmentType.name}`,
    `Beneficiario: ${appointment.beneficiary.name}`,
    `Fecha: ${appointment.date}`,
    `Hora: ${appointment.time}`,
    `Zona horaria: ${appointment.timezone}`,
    '',
    'Si necesitas cambios, ingresa a la plataforma para reprogramar o cancelar.',
  ].join('\n');
}

function buildCancellationTextBody(params: {
  appointment: MedicalAppointment;
  recipientName?: string;
}): string {
  const { appointment, recipientName } = params;
  const greeting = recipientName ? `Hola ${recipientName},` : 'Hola,';

  return [
    greeting,
    '',
    'Tu cita fue cancelada correctamente.',
    '',
    `Tipo: ${appointment.appointmentType.name}`,
    `Beneficiario: ${appointment.beneficiary.name}`,
    `Fecha: ${appointment.date}`,
    `Hora: ${appointment.time}`,
    `Zona horaria: ${appointment.timezone}`,
    '',
    'Si necesitas reprogramar, ingresa a la plataforma para agendar una nueva cita.',
  ].join('\n');
}

function buildReminderTextBody(params: {
  appointment: MedicalAppointment;
  recipientName?: string;
  message: string;
}): string {
  const { appointment, recipientName, message } = params;
  const greeting = recipientName ? `Hola ${recipientName},` : 'Hola,';

  return [
    greeting,
    '',
    message,
    '',
    `Tipo: ${appointment.appointmentType.name}`,
    `Beneficiario: ${appointment.beneficiary.name}`,
    `Fecha: ${appointment.date}`,
    `Hora: ${appointment.time}`,
    `Zona horaria: ${appointment.timezone}`,
    '',
    'Si necesitas cambios, ingresa a la plataforma para reprogramar o cancelar.',
  ].join('\n');
}

function buildConfirmationHtmlBody(params: {
  appointment: MedicalAppointment;
  recipientName?: string;
}): string {
  const { appointment, recipientName } = params;
  const greeting = recipientName ? `Hola ${recipientName},` : 'Hola,';

  return `
    <div style="margin:0; padding:0; background-color:#f3f8f7;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
        <tr>
          <td align="center" style="padding:28px 16px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px; border-collapse:collapse; background:#ffffff; border-radius:18px; overflow:hidden; box-shadow:0 10px 26px rgba(15,23,42,0.08);">
              <tr>
                <td style="padding:24px 32px; background:#14b8a6; color:#ffffff; font-family:'Plus Jakarta Sans','Inter',Arial,Helvetica,sans-serif;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="font-size:20px; font-weight:700; letter-spacing:0.3px;">AgendApp</td>
                      <td align="right" style="font-size:12px;">
                        <span style="display:inline-block; padding:6px 12px; background:#e9f5f3; color:#1f6f65; border-radius:999px; font-weight:600;">
                          Confirmacion de cita
                        </span>
                      </td>
                    </tr>
                  </table>
                  <div style="font-size:13px; opacity:0.9; margin-top:8px;">Citas medicas en un solo lugar</div>
                </td>
              </tr>
              <tr>
                <td style="padding:28px 32px 10px 32px; font-family:'Inter',Arial,Helvetica,sans-serif; color:#0f1b24; line-height:1.6;">
                  <p style="margin:0 0 16px 0; font-size:16px;">${greeting}</p>
                  <p style="margin:0 0 18px 0; font-size:14px; color:#4b5b66;">
                    Tu cita fue programada correctamente. Aqui tienes el resumen:
                  </p>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse; background:#f7fbfa; border:1px solid #d7e1e5; border-radius:12px;">
                    <tr>
                      <td style="padding:18px 20px;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                          <tr>
                            <td style="padding:6px 0; font-size:13px; color:#6b7c86;">Tipo</td>
                            <td style="padding:6px 0; font-size:14px; font-weight:600; text-align:right; color:#0f1b24;">${appointment.appointmentType.name}</td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0; font-size:13px; color:#6b7c86;">Beneficiario</td>
                            <td style="padding:6px 0; font-size:14px; font-weight:600; text-align:right; color:#0f1b24;">${appointment.beneficiary.name}</td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0; font-size:13px; color:#6b7c86;">Fecha</td>
                            <td style="padding:6px 0; font-size:14px; font-weight:600; text-align:right; color:#0f1b24;">${appointment.date}</td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0; font-size:13px; color:#6b7c86;">Hora</td>
                            <td style="padding:6px 0; font-size:14px; font-weight:600; text-align:right; color:#0f1b24;">${appointment.time}</td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0; font-size:13px; color:#6b7c86;">Zona horaria</td>
                            <td style="padding:6px 0; font-size:14px; font-weight:600; text-align:right; color:#0f1b24;">${appointment.timezone}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  <p style="margin:18px 0 0 0; font-size:13px; color:#4b5b66;">
                    Si necesitas cambios, ingresa a la plataforma para reprogramar o cancelar.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 32px 24px 32px; font-family:'Inter',Arial,Helvetica,sans-serif; font-size:12px; color:#97a6b2; text-align:center;">
                  Este correo es informativo. No respondas a este mensaje.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
}

function buildCancellationHtmlBody(params: {
  appointment: MedicalAppointment;
  recipientName?: string;
}): string {
  const { appointment, recipientName } = params;
  const greeting = recipientName ? `Hola ${recipientName},` : 'Hola,';

  return `
    <div style="margin:0; padding:0; background-color:#f3f8f7;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
        <tr>
          <td align="center" style="padding:28px 16px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px; border-collapse:collapse; background:#ffffff; border-radius:18px; overflow:hidden; box-shadow:0 10px 26px rgba(15,23,42,0.08);">
              <tr>
                <td style="padding:24px 32px; background:#14b8a6; color:#ffffff; font-family:'Plus Jakarta Sans','Inter',Arial,Helvetica,sans-serif;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="font-size:20px; font-weight:700; letter-spacing:0.3px;">AgendApp</td>
                      <td align="right" style="font-size:12px;">
                        <span style="display:inline-block; padding:6px 12px; background:#ffe4e6; color:#9f1239; border-radius:999px; font-weight:600;">
                          Cita cancelada
                        </span>
                      </td>
                    </tr>
                  </table>
                  <div style="font-size:13px; opacity:0.9; margin-top:8px;">Citas medicas en un solo lugar</div>
                </td>
              </tr>
              <tr>
                <td style="padding:28px 32px 10px 32px; font-family:'Inter',Arial,Helvetica,sans-serif; color:#0f1b24; line-height:1.6;">
                  <p style="margin:0 0 16px 0; font-size:16px;">${greeting}</p>
                  <p style="margin:0 0 18px 0; font-size:14px; color:#4b5b66;">
                    Tu cita fue cancelada correctamente. Aqui tienes el resumen:
                  </p>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse; background:#f7fbfa; border:1px solid #d7e1e5; border-radius:12px;">
                    <tr>
                      <td style="padding:18px 20px;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                          <tr>
                            <td style="padding:6px 0; font-size:13px; color:#6b7c86;">Tipo</td>
                            <td style="padding:6px 0; font-size:14px; font-weight:600; text-align:right; color:#0f1b24;">${appointment.appointmentType.name}</td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0; font-size:13px; color:#6b7c86;">Beneficiario</td>
                            <td style="padding:6px 0; font-size:14px; font-weight:600; text-align:right; color:#0f1b24;">${appointment.beneficiary.name}</td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0; font-size:13px; color:#6b7c86;">Fecha</td>
                            <td style="padding:6px 0; font-size:14px; font-weight:600; text-align:right; color:#0f1b24;">${appointment.date}</td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0; font-size:13px; color:#6b7c86;">Hora</td>
                            <td style="padding:6px 0; font-size:14px; font-weight:600; text-align:right; color:#0f1b24;">${appointment.time}</td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0; font-size:13px; color:#6b7c86;">Zona horaria</td>
                            <td style="padding:6px 0; font-size:14px; font-weight:600; text-align:right; color:#0f1b24;">${appointment.timezone}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  <p style="margin:18px 0 0 0; font-size:13px; color:#4b5b66;">
                    Si necesitas reprogramar, ingresa a la plataforma para agendar una nueva cita.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 32px 24px 32px; font-family:'Inter',Arial,Helvetica,sans-serif; font-size:12px; color:#97a6b2; text-align:center;">
                  Este correo es informativo. No respondas a este mensaje.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
}

function buildReminderHtmlBody(params: {
  appointment: MedicalAppointment;
  recipientName?: string;
  badgeText: string;
  badgeBg: string;
  badgeColor: string;
  message: string;
}): string {
  const { appointment, recipientName, badgeText, badgeBg, badgeColor, message } = params;
  const greeting = recipientName ? `Hola ${recipientName},` : 'Hola,';

  return `
    <div style="margin:0; padding:0; background-color:#f3f8f7;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
        <tr>
          <td align="center" style="padding:28px 16px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px; border-collapse:collapse; background:#ffffff; border-radius:18px; overflow:hidden; box-shadow:0 10px 26px rgba(15,23,42,0.08);">
              <tr>
                <td style="padding:24px 32px; background:#14b8a6; color:#ffffff; font-family:'Plus Jakarta Sans','Inter',Arial,Helvetica,sans-serif;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="font-size:20px; font-weight:700; letter-spacing:0.3px;">AgendApp</td>
                      <td align="right" style="font-size:12px;">
                        <span style="display:inline-block; padding:6px 12px; background:${badgeBg}; color:${badgeColor}; border-radius:999px; font-weight:600;">
                          ${badgeText}
                        </span>
                      </td>
                    </tr>
                  </table>
                  <div style="font-size:13px; opacity:0.9; margin-top:8px;">Citas medicas en un solo lugar</div>
                </td>
              </tr>
              <tr>
                <td style="padding:28px 32px 10px 32px; font-family:'Inter',Arial,Helvetica,sans-serif; color:#0f1b24; line-height:1.6;">
                  <p style="margin:0 0 16px 0; font-size:16px;">${greeting}</p>
                  <p style="margin:0 0 18px 0; font-size:14px; color:#4b5b66;">${message}</p>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse; background:#f7fbfa; border:1px solid #d7e1e5; border-radius:12px;">
                    <tr>
                      <td style="padding:18px 20px;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                          <tr>
                            <td style="padding:6px 0; font-size:13px; color:#6b7c86;">Tipo</td>
                            <td style="padding:6px 0; font-size:14px; font-weight:600; text-align:right; color:#0f1b24;">${appointment.appointmentType.name}</td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0; font-size:13px; color:#6b7c86;">Beneficiario</td>
                            <td style="padding:6px 0; font-size:14px; font-weight:600; text-align:right; color:#0f1b24;">${appointment.beneficiary.name}</td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0; font-size:13px; color:#6b7c86;">Fecha</td>
                            <td style="padding:6px 0; font-size:14px; font-weight:600; text-align:right; color:#0f1b24;">${appointment.date}</td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0; font-size:13px; color:#6b7c86;">Hora</td>
                            <td style="padding:6px 0; font-size:14px; font-weight:600; text-align:right; color:#0f1b24;">${appointment.time}</td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0; font-size:13px; color:#6b7c86;">Zona horaria</td>
                            <td style="padding:6px 0; font-size:14px; font-weight:600; text-align:right; color:#0f1b24;">${appointment.timezone}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  <p style="margin:18px 0 0 0; font-size:13px; color:#4b5b66;">
                    Si necesitas cambios, ingresa a la plataforma para reprogramar o cancelar.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 32px 24px 32px; font-family:'Inter',Arial,Helvetica,sans-serif; font-size:12px; color:#97a6b2; text-align:center;">
                  Este correo es informativo. No respondas a este mensaje.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
}

export async function sendAppointmentConfirmation(params: {
  to: string;
  appointment: MedicalAppointment;
  recipientName?: string;
}): Promise<boolean> {
  const transporter = getTransporter();

  if (!transporter) {
    logger.warn('[Email] Configuracion de correo no encontrada.');
    return false;
  }

  const email = config.email;

  try {
    await transporter.sendMail({
      from: `${email.fromName} <${email.fromEmail}>`,
      to: params.to,
      subject: buildConfirmationSubject(params.appointment),
      text: buildConfirmationTextBody(params),
      html: buildConfirmationHtmlBody(params),
    });

    logger.info(`[Email] Confirmacion enviada a ${params.to}`);
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.warn(`[Email] Error enviando confirmacion: ${message}`);
    return false;
  }
}

export async function sendAppointmentCancellation(params: {
  to: string;
  appointment: MedicalAppointment;
  recipientName?: string;
}): Promise<boolean> {
  const transporter = getTransporter();

  if (!transporter) {
    logger.warn('[Email] Configuracion de correo no encontrada.');
    return false;
  }

  const email = config.email;

  try {
    await transporter.sendMail({
      from: `${email.fromName} <${email.fromEmail}>`,
      to: params.to,
      subject: buildCancellationSubject(params.appointment),
      text: buildCancellationTextBody(params),
      html: buildCancellationHtmlBody(params),
    });

    logger.info(`[Email] Cancelacion enviada a ${params.to}`);
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.warn(`[Email] Error enviando cancelacion: ${message}`);
    return false;
  }
}

export async function sendAppointmentReminder(params: {
  to: string;
  appointment: MedicalAppointment;
  recipientName?: string;
  reminderType: '24h' | '1h' | 'dev-1m';
}): Promise<boolean> {
  const transporter = getTransporter();

  if (!transporter) {
    logger.warn('[Email] Configuracion de correo no encontrada.');
    return false;
  }

  const email = config.email;
  const reminderMeta =
    params.reminderType === '24h'
      ? {
          label: '24 horas',
          badgeText: 'Recordatorio 24h',
          badgeBg: '#fff7ed',
          badgeColor: '#c2410c',
          message: 'Faltan 24 horas para tu cita. Aqui tienes el resumen:',
        }
      : params.reminderType === '1h'
        ? {
            label: '1 hora',
            badgeText: 'Recordatorio 1h',
            badgeBg: '#fef3c7',
            badgeColor: '#b45309',
            message: 'Tu cita es en aproximadamente 1 hora. Aqui tienes el resumen:',
          }
        : {
            label: 'prueba',
            badgeText: 'Recordatorio prueba',
            badgeBg: '#e0f2fe',
            badgeColor: '#0369a1',
            message: 'Este es un recordatorio de prueba enviado 1 minuto despues de programar la cita.',
          };

  try {
    await transporter.sendMail({
      from: `${email.fromName} <${email.fromEmail}>`,
      to: params.to,
      subject: buildReminderSubject(params.appointment, reminderMeta.label),
      text: buildReminderTextBody({
        appointment: params.appointment,
        recipientName: params.recipientName,
        message: reminderMeta.message,
      }),
      html: buildReminderHtmlBody({
        appointment: params.appointment,
        recipientName: params.recipientName,
        badgeText: reminderMeta.badgeText,
        badgeBg: reminderMeta.badgeBg,
        badgeColor: reminderMeta.badgeColor,
        message: reminderMeta.message,
      }),
    });

    logger.info(`[Email] Recordatorio enviado a ${params.to}`);
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.warn(`[Email] Error enviando recordatorio: ${message}`);
    return false;
  }
}
