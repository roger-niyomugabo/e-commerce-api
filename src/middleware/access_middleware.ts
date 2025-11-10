/* eslint-disable sonarjs/no-duplicate-string */
import { NextFunction, Request, Response } from 'express';
import out from '../utils/response';
import { verify } from '../utils/jwt';

const capitalize = (string) => string.charAt(0).toUpperCase() + string.slice(1);

export const decodeToken = (req: Request) => {
    try {
        if (!req.headers.authorization) {
            throw new Error('Invalid access token');
        }
        const token = req.headers.authorization.split(' ')[1];
        return verify(token);
    // eslint-disable-next-line sonarjs/no-useless-catch
    } catch (error) {
        throw error;
    }
};
export const isLoggedIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
        req.user = await decodeToken(req);
        return next();
    } catch (error) {
        return out(res, 401, capitalize(error.message || error), null, 'AUTHENTICATION_ERROR');
    }
};
export const isAdmin = async (req, res, next) => {
    try {
        req.user = await decodeToken(req);
        if (req.user.role !== 'admin') {
            return out(res, 403, 'You don\'t have access to do that action', null, 'FORBIDDEN');
        }
        return next();
    } catch (error) {
        return out(res, 401, capitalize(error.message || error), null, 'AUTHENTICATION_ERROR');
    }
};
