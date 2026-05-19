import { Router } from 'express';
import {
  activeAppointmentsHandler,
  appointmentContextHandler,
  appointmentHistoryHandler,
  availabilityHandler,
  cancelAppointmentHandler,
  cancelFlowHandler,
  rescheduleAppointmentHandler,
  scheduleAppointmentHandler,
} from '../controllers/appointment.controller.js';
import { requireSession } from '../middleware/auth/session.middleware.js';
import {
  rescheduleAppointmentValidationRules,
  scheduleAppointmentValidationRules,
} from '../middleware/validation/appointment.validation.js';

const appointmentRouter = Router();

appointmentRouter.use(requireSession);

appointmentRouter.get('/context', appointmentContextHandler);
appointmentRouter.get('/availability', availabilityHandler);
appointmentRouter.post('/schedule', scheduleAppointmentValidationRules, scheduleAppointmentHandler);
appointmentRouter.post('/cancel-flow', cancelFlowHandler);
appointmentRouter.get('/active', activeAppointmentsHandler);
appointmentRouter.get('/history', appointmentHistoryHandler);
appointmentRouter.post('/:appointmentId/cancel', cancelAppointmentHandler);
appointmentRouter.post(
  '/:appointmentId/reschedule',
  rescheduleAppointmentValidationRules,
  rescheduleAppointmentHandler,
);

export default appointmentRouter;
