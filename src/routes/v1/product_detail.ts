import express, { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { validate } from '../../middleware/middleware';
import { asyncMiddleware } from '../../middleware/error_middleware';
import output from '../../utils/response';
import { isAdmin } from '../../middleware/access_middleware';
import { Product, User } from '../../db/models';

const router = express.Router({ mergeParams: true });

const productUpdateValidations = Joi.object({
    name: Joi.string().min(3).max(100).required().messages({
        'string.base': 'Name must be a string',
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 3 characters',
        'string.max': 'Name cannot exceed 100 characters',
    }),
    description: Joi.string().min(10).required().messages({
        'string.base': 'Description must be a string',
        'string.empty': 'Description is required',
        'string.min': 'Description must be at least 10 characters',
    }),
    price: Joi.number().greater(0).required().messages({
        'number.base': 'Price must be a number',
        'number.greater': 'Price must be greater than 0',
        'any.required': 'Price is required',
    }),
    stock: Joi.number().integer().min(0).required().messages({
        'number.base': 'Stock must be a number',
        'number.integer': 'Stock must be an integer',
        'number.min': 'Stock cannot be negative',
        'any.required': 'Stock is required',
    }),
    categoryId: Joi.string().guid({ version: 'uuidv4' }).required().messages({
        'string.base': 'CategoryId must be a string',
        'string.guid': 'CategoryId must be a valid UUID',
        'any.required': 'CategoryId is required',
    }),
});

// Product update
router.put('/', isAdmin, validate(productUpdateValidations), asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.user;
    const { productId } = req.params;

    const userPromise = User.findOne({ where: { id: userId } });
    const productExistPromise = Product.findOne({ where: { id: productId } });
    const [productExist, user] = await Promise.all([productExistPromise, userPromise]);

    if (!user) {
        return output(res, 404, 'User not found', null, 'NOT_FOUND');
    }
    if (!productExist) {
        return output(res, 404, 'Product does not exist', null, 'NOT_FOUND');
    }

    await productExist.update(req.body);
    const updatedProduct = await Product.findOne({ where: { id: productId } });

    return output(res, 200, 'Product updated successfully', updatedProduct, null);
}));

// Get product details
router.get('/', asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;

    const product = await Product.findOne({ where: { id: productId }, include: ['category'] });
    if (!product) {
        return output(res, 404, 'Product not found', null, 'NOT_FOUND');
    }
    return output(res, 200, 'Product retrieved successfully', product, null);
})
);

export default router;
