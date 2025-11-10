import { NextFunction, Request, RequestHandler, Response } from 'express';
import Joi from 'joi';
import { processPagination } from '../utils/index';

/**
// Middleware to process the pagination and save the var we need in the local storage.
 * @param {Request} req Request object
 * @param {Response} res Response object
 * @param {NextFunction} next Function to go to the next middleware
 */
export const pagination: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const { page, offset, limit } = processPagination(parseInt(req.query.page as string), parseInt(req.query.count as string));

    res.locals.pagination = {
        page: page,
        offset: offset,
        limit: limit,
    };
    next();
};

/**
// Middleware to validate a request with the schemaValidator.
 * @param {object} schemaValidator Request object
 * @return {object} Return de error object or pass to the next middleware
 */
export const validate = (schemaValidator: Joi.ObjectSchema) => {
    return function (req: Request, res: Response, next: NextFunction) {
        const { error, value } = schemaValidator.validate(req.body, { abortEarly: false, stripUnknown: true });

        if (error) {
            const customErrors = error.details.map((err) => {
                return {
                    message: err.message,
                    param: err.context.label,
                    value: err.context.value,
                };
            });
            return res.status(400).json({
                title: 'invalid data in request body',
                errors: customErrors,
            });
        }

        req.body = value;
        next();
    };
};
