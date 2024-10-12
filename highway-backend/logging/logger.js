const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf, colorize } = format;

const logger = createLogger({
  level: "info",
  format: combine(
    colorize(),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    printf(
      ({ level, message, timestamp }) => `${timestamp} ${level}: ${message}`
    )
  ),
  transports: [new transports.Console()],
});

logger.exceptions.handle(
  new transports.Console({
    format: combine(
      colorize(),
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      printf(
        ({ level, message, timestamp }) => `${timestamp} ${level}: ${message}`
      )
    ),
  })
);

module.exports = logger;
