import { body } from 'express-validator';
import { handleValidationErrors } from './common.validation';

export const intakeValidationRules = [
  body('name')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('name es requerido'),

  body('epsId').optional().isString().trim(),
  body('documentType').optional().isString().trim(),
  body('documentNumber').optional().isString().trim(),
  body('phone').optional().isString().trim(),
  body('email').optional().isEmail().withMessage('email debe ser valido'),

  handleValidationErrors,
];
