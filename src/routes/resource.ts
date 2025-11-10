import express, { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { validate } from '../middleware/middleware';
import { asyncMiddleware } from '../middleware/error_middleware';
const router = express.Router();

/* GET resource */
router.get('/', asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    // eslint-disable-next-line no-console
    return res.status(200).json({ 'message': 'hello world' });
}));

// PATCH resource validator
const testValidator = Joi.object({
    name: Joi.string().max(50),
    description: Joi.string().max(300),
});

// PATCH resource
router.patch('/', validate(testValidator), asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json({ 'body': req.body });
})
);

export default router;
