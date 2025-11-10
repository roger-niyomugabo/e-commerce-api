import express, { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { Op } from 'sequelize';
import { validate } from '../../middleware/middleware';
import { asyncMiddleware } from '../../middleware/error_middleware';
import output from '../../utils/response';
import { generate } from '../../utils/bcrypt';
import { passwordRegex } from '../../utils/globalValidations';

const router = express.Router();

// model imports
import { User } from '../../db/models';

// User registration validations
const userSignupValidations = Joi.object({
    username: Joi.string().alphanum().required().messages({
        'string.base': 'Please provide a valid username',
        'string.alphanum': 'Username must contain letters and numbers only, no special characters or spaces',
        'string.empty': 'Username is required',
    }),
    email: Joi.string().email().required().messages({
        'string.base': 'Please provide a valid email',
        'string.email': 'Please provide a valid email address',
        'string.empty': 'Email is required',
    }),
    password: Joi.string().regex(passwordRegex).required().messages({
        'string.base': 'Please provide a valid password',
        'string.pattern.base': 'Password must be at least 8 characters, one uppercase, one lowercase, one digit and one special character',
        'string.empty': 'Password is required',
    }),
});

// User signup
router.post('/register', validate(userSignupValidations), asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    const { email, username, password } = req.body;
    const userExists = await User.findOne({ where: { [Op.or]: [{ email }, { username }] } });
    if (userExists) {
        return output(res, 400, 'Email or username already exists', null, 'BAD_REQUEST');
    }
    const hashedPassword = await generate(password);
    const user = await User.create({ ...req.body, password: hashedPassword, role: 'user' });
    user.password = undefined;

    return output(res, 201, 'Signed up successfully', user, null);
})
);

export default router;
