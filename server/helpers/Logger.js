

const winston = require('winston');
const { getTime } = require('./common');
// logger.debug("Filename=" + __filename);

/* const myLogFormatter = function (options) {
  var formatted = new Date() + ' [' + options.level.toUpperCase() + '] ' + (options.message ? options.message : '') +
    (options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '');
  return options.colorize ? winston.config.colorize(options.level, formatted) : formatted;
}; */

global.logger = winston.createLogger({
  levels: {
    debug: 0, // FILENAME
    input: 1, // INPUT in REQUEST
    info: 2, // SPECIFIC FvfUNCTION OR QUERY CALLED
    output: 3, // OUTPUT OF QUERY OR FUNCTION or REQUEST
    warn: 4, // NULL RESULT FROM DB
    error: 5, // ERROR in FUNCTION OR QUERY
  },

  transports: [
    new winston.transports.File({
      level: 'output',
      filename: './logs/payload.log',
      // handleExceptions: true,
      json: true,
      // maxsize: 5242880, //5MB
      // maxFiles: 5,
      timestamp: () => +getTime('+5.5'),
      colorize: false,
    }),
    new winston.transports.Console({
      level: 'error',
      prettyPrint: true,
      colorize: false,
      timestamp: true,
      format: winston.format.combine(
        // winston.format.colorize({ all: true }),
        winston.format.timestamp(),
        winston.format.align(),
        winston.format.printf((info) => {
          const {
            timestamp, level, message, ...args
          } = info;
          const ts = timestamp.slice(0, 19).replace('T', ' ');
          return `${ts} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
        }),
      ),
    }),
  ],
});

// logger.debug("Logger Testing");
// logger.input("INPUT");
// logger.info("INFORMATION");
// logger.output("DATA");
// logger.warn("WARN");
// logger.error("ERROR");

// logger.debug("FILE %s", __filename);
logger.log('output', 'Logger Initiated!!!');
