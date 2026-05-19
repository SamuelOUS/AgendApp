import { body } from 'express-validator';
import { DOCUMENT_TYPES } from '../../types/auth.types';
import { handleValidationErrors } from './common.validation';



//Array de middleware validan cada campo form login
export const loginValidationRules = [
  body('epsId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('epsId es requerido'),

  body('documentType')
    .isIn(DOCUMENT_TYPES)
    .withMessage(
      'Tipo de documento inválido. Valores permitidos: C, T, P, E, R',
    ),

  body('documentNumber')
    .isString()
    .trim()
    .matches(/^\d{5,15}$/)
    .withMessage('Número de documento debe contener entre 5 y 15 dígitos'),

  body('password')
    .isString()
    .isLength({ min: 4, max:4 })
    .withMessage('La contraseña debe tener 4 caracteres'),

  body('intakeId')
    .optional()
    .isString()
    .trim(),

  // Siempre al final: ejecuta las validaciones y corta si hay errores
  handleValidationErrors,
];
