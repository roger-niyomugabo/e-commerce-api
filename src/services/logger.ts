import { Request, Response } from 'express';
import winston from 'winston';
import config from '../config';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const customFormat = winston.format.printf(({ level, message, label, timestamp, meta }) => {
    if (typeof message === 'object') {
        message = JSON.stringify(message);
    }
    if (meta?.error?.stack){
        return `${timestamp} [${level}]: ${message} ${meta.error.stack}`;
    }
    return `${timestamp} [${level}]: ${message}`;
});

export const logger = winston.createLogger({
    levels: winston.config.npm.levels,
    format: (process.env.NODE_ENV === 'development' ?
        winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.simple(),
            customFormat
            // winston.format.prettyPrint()
        )
        :
        winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
        )),
    defaultMeta: {
        logger: 'winston',
        service: 'e-commerce',
    },
    transports: [
        new winston.transports.Console({
            level: config.logs.level,
            handleExceptions: true,
            handleRejections: true,
            // Mute logger if doing tests
            silent: process.env.NODE_ENV === 'test',
        }),
    ],
    exitOnError: true,
});

// Always take into account not logging passwords
const bodyBlacklist = ['password', ...config.logs.requestBodyBlacklist];
const headerBlacklist = ['authorization', ...config.logs.requestHeaderBlacklist];
export const getReqParams = (req: Request, res: Response, err = null) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: any = {
        headers: { ...req.headers },
        httpVersion: req.httpVersion,
        method: req.method,
        originalUrl: req.originalUrl,
        url: req.url,
    };
    for (const item of headerBlacklist) {
        if (params.headers[item]){
            params.headers[item] = 'omitted';
        }
    }
    if (res.statusCode >= 400 || err) {
        params.query = { ...req.query };
        params.body = { ...req.body };
        for (const item of bodyBlacklist) {
            if (params.body[item]){
                params.body[item] = 'omitted';
            }
        }
    }
    return params;
};
export const getResParams = (res: Response) => {
    return {
        statusCode: res.statusCode,
    };
};

export const getLogLevel = (resStatusCode) => {
    if (resStatusCode >= 500) {
        return 'error';
    }
    if (resStatusCode >= 400) {
        return 'warn';
    }
    if (resStatusCode >= 100) {
        return 'info';
    }
    return 'error';
};
