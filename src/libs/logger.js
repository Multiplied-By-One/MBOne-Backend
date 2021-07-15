const Logger = ({}) => {
    const LOGLEVEL = {
        ERROR: 'ERROR',
        WARN: 'WARN',
        INFO: 'INFO',
    }

    const generateLogString = (loglevel, { hasTimestamp=true, logMessage='', username='', errobj=null}) => {
        const timestamp = hasTimestamp ? new Date().toString() : ''
        return `${loglevel}: ${timestamp} [${username}]: ${logMessage}`
    }

    const log = (loglevel='log', logcontent) => {
        if(!logcontent) return
    
        const generatedLogContent = logcontent.errObj || generateLogString(loglevel, logcontent)
    
        if(loglevel === 'ERROR') {
            console.error(generatedLogContent)
        } else if(loglevel === 'INFO') {
            console.info(generatedLogContent)
        } else {
            console.log(generatedLogContent)
        }
    
        if(!logcontent.errObj) {
            console.trace
        }
    }

    return {
        LOGLEVEL,
        log
    }
}

export default Logger