import express, { NextFunction, Request, Response } from 'express';
import { asyncMiddleware } from '../middleware/error_middleware';
const router = express.Router();
// Endpoint /health/started just defines that the service has been initialized. Makes no checks
router.get('/started', asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json();
}));

export default router;
