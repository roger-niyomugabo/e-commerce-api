import { ErrorRequestHandler, NextFunction, Request, RequestHandler, Response } from 'express';
import winston from 'winston';
import { getLogLevel, getReqParams, getResParams, logger } from '../services/logger';

export const requestLogger: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
        try {
            const responseTime = Date.now() - start;
            const msg = `${req.method} ${req.url} ${res.statusCode} ${responseTime}ms`;

            const meta = {
                req: getReqParams(req, res),
                res: getResParams(res),
                responseTime: responseTime,
            };

            logger.log({
                level: getLogLevel(res.statusCode),
                message: msg,
                meta: meta,
            });
        } catch (err) {
            next(err);
        }
    });

    next();
};

export const errorLogger: ErrorRequestHandler = (err, req: Request, res: Response, next: NextFunction) => {
    try {
        const msg = `${req.method} ${req.url}`;

        const meta = {
            req: getReqParams(req, res, err),
            error: {
                os: winston.exceptions.getOsInfo(),
                process: winston.exceptions.getProcessInfo(),
                trace: winston.exceptions.getTrace(err),
                errorData: err,
                stack: err.stack,
            },
        };

        logger.log({
            level: 'error',
            message: msg,
            meta: meta,
        });
    } catch (catchError) {
        logger.log({
            level: 'error',
            message: 'Error in errorLogger middleware',
            meta: {
                error: catchError.stack,
                originalError: err.stack,
            },
        });
        next(catchError);
    }
    next(err);
};
