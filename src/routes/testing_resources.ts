import express, { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { pagination, validate } from '../middleware/middleware';
import { asyncMiddleware } from '../middleware/error_middleware';
const router = express.Router();

router.get('/', pagination, asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json({
        res: {
            locals: res.locals,
        },
    });
}));

router.get('/error', asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    throw new Error('Testing error');
    return res.status(200).json({ 'message': 'hello test' });
}));

router.get('/error_async', asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    await new Promise(() => {
        throw new Error('Testing error');
    });
    return res.status(200).json({ 'message': 'hello test' });
}));

const testValidator = Joi.object({
    name: Joi.string().max(50),
    description: Joi.string().max(300),
});
router.patch('/validator_one', validate(testValidator), asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json({
        req: {
            body: req.body,
        },
    });
}));

const testValidator2 = Joi.object({
    name: Joi.string().max(50).required(),
    someArray: Joi.array().items(Joi.string().valid('one', 'two')).unique(),
});
router.patch('/validator_two', validate(testValidator2), asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json({
        req: {
            body: req.body,
        },
    });
}));

export default router;
