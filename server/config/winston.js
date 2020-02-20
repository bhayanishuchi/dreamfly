var appRoot = require('app-root-path');
var winston = require('winston');
const MESSAGE = Symbol.for('message');
const { createLogger, format, transports } = require('winston');
// define the custom settings for each transport (file, console)
// var options = {
//  file: {
//   level: 'info',
//     filename: `${appRoot}/logs/app.log`,
//     handleExceptions: true,
//     json: true,
//     prettyPrint: true,
//     maxsize: 5242880, // 5MB
//     maxFiles: 5,
//     colorize: false,
// },
//   console: {
//     level: 'debug',
//     handleExceptions: true,
//     json: false,
//     colorize: true,
//   },
// };
//
// // instantiate a new Winston Logger with the settings defined above
// const logger = createLogger({
//   level: 'info',
//   format: format.combine(
//     format.colorize(),
//     format.timestamp({
//       format: 'YYYY-MM-DD HH:mm:ss'
//     }),
//     format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
//   ),
//   transports: [
//     new winston.transports.Console(),
//     new winston.transports.File({ filename: `${appRoot}/logs/app.log`})
//   ]
// });
// // var logger = new winston.createLogger({
// //   transports: [
// //     // new winston.transports.File(options.file),
// //     // new winston.transports.Console(options.console)
// //     new winston.transports.File({ filename: `${appRoot}/logs/error.log`, level: 'error' }),
// //     new winston.transports.File({ filename: `${appRoot}/logs/combined.log`})
// //   ],
// //   exitOnError: false, // do not exit on handled exceptions
// // });
//
// // create a stream object with a 'write' function that will be used by `morgan`
// logger.stream = {
//   write: function(message, encoding) {
//     // use the 'info' log level so the output will be picked up by both transports (file and console)
//     logger.info(message);
//   },
// };


var options = {
  file: {
    level: 'info',
    filename: `${appRoot}/logs/combined.log`,
    handleExceptions: true,
    json: true,
    prettyPrint: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: true,
  },
  file1 : {
    level: 'error',
    filename: `${appRoot}/logs/error.log`,
    handleExceptions: true,
    json: true,
    prettyPrint: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: true,
  }
};

const jsonFormatter = (logEntry) => {
  const base = { timestamp: new Date() };
  const json = Object.assign(base, logEntry)
  logEntry[MESSAGE] = JSON.stringify(json, null, 2);
  return logEntry;
}
const logger = winston.createLogger({
  format: winston.format(jsonFormatter)(),
  transports: [
    new winston.transports.File(options.file1),
    new winston.transports.File(options.file)

  ]
});

logger.stream = {
  write: function(message, encoding) {
    // use the 'info' log level so the output will be picked up by both transports (file and console)
    logger.info(message);
  },
};

module.exports = logger;
