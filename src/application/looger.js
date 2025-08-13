import { createLogger, format, transports } from "winston";

const logger = createLogger({
    level: "info", //default level
    format: format.combine( //format logger
        // mengatur timestamp
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss "}), 
        // mengatur format lengkap tercetak nya pesan ke console
        format.printf(({timestamp, level, message}) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        })
    ),
    // Mengatur ke mana logger di simpan dan dimunculukan 
    transports: [
        // ke console
        new transports.Console(),
    ]
})

export default logger