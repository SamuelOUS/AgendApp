import { body } from 'express-validator';
import { handleValidationErrors } from './common.validation';

export const scheduleAppointmentValidationRules = [
  body('beneficiaryId').isString().trim().notEmpty().withMessage('beneficiaryId es requerido'),
  body('appointmentTypeId').isString().trim().notEmpty().withMessage('appointmentTypeId es requerido'),
  body('date')
    .isString()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('date debe usar formato YYYY-MM-DD'),
  body('time')
    .isString()
    .matches(/^\d{2}:\d{2}$/)
    .withMessage('time debe usar formato HH:mm'),
  body('timezone').isString().trim().notEmpty().withMessage('timezone es requerido'),
  handleValidationErrors,
];
