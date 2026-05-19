import winston from 'winston';

const { combine, timestamp, colorize, printf } = winston.format;


// logs para desarrollo
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  printf(({ level, message, timestamp: ts, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${ts} [${level}] ${message}${metaStr}`;
  }),
);

export const logger = winston.createLogger({
  level: 'debug',
  format: devFormat,
  transports: [new winston.transports.Console()],
});
