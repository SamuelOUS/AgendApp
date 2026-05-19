import { Router } from 'express';
import { loginHandler, logoutHandler } from '../controllers/auth.controller.js';
import { loginValidationRules } from '../middleware/validation/auth.validation.js';
import { requireSession } from '../middleware/auth/session.middleware.js';


const authRouter = Router();


//Login en el portal EPS, devuelve sessionId
authRouter.post(
  '/login',
  loginValidationRules,  
  loginHandler,          
);


//Cierra la sesion activa 
authRouter.post(
  '/logout',
  requireSession,  //valida x-session-id header
  logoutHandler,     
);

export default authRouter;