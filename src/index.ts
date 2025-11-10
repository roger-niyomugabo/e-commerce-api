import express from 'express';
import dotenv from 'dotenv';
import { Server } from 'http';
import { db } from './db';
import createServer from './app';
import { checkEnvVars } from './utils';
import config from './config';
import { logger } from './services/logger';
// import tokenManager from "./services/token_manager";

// initialize configuration
dotenv.config();

const app = express();

// set app port
const port = parseInt(process.env.PORT) || 3000;

// Check all compulsory ENV vars are loaded
const erroredVars = checkEnvVars(config.requiredEnvVars);
if (erroredVars.length) {
    throw Error(`Missing ENV vars: ${erroredVars}`);
}

// Execute async tasks and, if all of then are ok, start service
let server: Server;
(async () => {
    // Database sync. If 'force' set to 'true' the current database is erased and created again
    // If 'alter' set to 'true' the current database is updated with the new changes
    await db.sync({ alter: (process.env.NODE_ENV === 'development' ? true : false) }).then(async () => {
        logger.info({ message: 'E-commerce database sync done' });
    });
    // Load express app and start listening
    createServer(app);
    server = app.listen(port, () => {
        logger.info({ message: `Service listening on port ${port}` });
    });
})().catch(err => {
    logger.error({ message: 'Error on service startup:', meta: { error: err } });
});

// Kill processes on process end
const closeGracefully = async (signal) => {
    logger.info({ message: 'Gracefully closing...' });
    db.close();
    server.close(() => {
        logger.warn({ message: 'E-commerce API stopped' });
    });
    process.kill(process.pid, signal);
};
process.on('SIGINT', closeGracefully);
process.on('SIGTERM', closeGracefully);
