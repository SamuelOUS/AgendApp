import dotenv from 'dotenv';
dotenv.config();


export const config = {
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',

  frontend: {
    url: process.env.FRONTEND_URL ?? 'http://localhost:8080',
  },

  playwright: {
    headless: process.env.HEADLESS !== 'false',
    slowMo: parseInt(process.env.SLOW_MO ?? '100', 10),
  },

  //Donde navega playwright en el portal eps
  portal: {
    loginUrl: 
      process.env.LOGIN_URL ?? 
      'https://login.sura.com/sso/servicelogin.aspx?continueTo=https%3A%2F%2Fportaleps.epssura.com%2FServiciosUnClick%2F&service=epssura',
    portalUrlLogged:
      process.env.PORTAL_URL_LOGGED ??
      'https://portaleps.epssura.com/ServiciosUnClick/#/',
    consultarAfiliadoUrl:
      process.env.CONSULTAR_AFILIADO_URL ??
      'https://portaleps.epssura.com/TramitesUnClickNet/api/AfiliacionesService/ConsultarDatosAfiliado',
  },

  session: {
    ttlMinutes: parseInt(process.env.SESSION_TTL_MINUTES ?? '30', 10), //duracion sesion en min
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS ?? '3', 10), //maximos intentos login permitidos
  },

} as const;
