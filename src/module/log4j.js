import log4js from 'log4js'
log4js.configure({
    appenders: {
        out: { type: 'console' },
        app: {
            type: 'file',
            filename: 'logs/access.log',
            maxLogSize: 10240,
            backups: 4,
            category: 'debug'
        }
    }
    ,
    categories: {
        default: { appenders: ['out', 'app'], level: 'debug' }
    },
    replaceConsole: true
})

exports.logger = function (name) {
    var logger = log4js.getLogger(name)
    // logger.setLevel('INFO')
    logger.level = 'debug'
    return logger
}