import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10, // 10 attempts
    message: { message: 'Too many attempts, please try again later.' },
});

export const orderLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests
    message: { message: 'Too many order requests, please try again later.' },
});
