import express, { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { Op, WhereOptions } from 'sequelize';
import { pagination, validate } from '../../middleware/middleware';
import { asyncMiddleware } from '../../middleware/error_middleware';
import output from '../../utils/response';
import { isAdmin } from '../../middleware/access_middleware';
import { Category, Product, User } from '../../db/models';
import cloudinaryUpload from '../../utils/file_upload';
import { computePaginationRes } from '../../utils';
import redis from '../../config/redis';

const router = express.Router({ mergeParams: true });

const productValidations = Joi.object({
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

// Product create
router.post('/', isAdmin, cloudinaryUpload.single('image'), validate(productValidations), asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    const { name, categoryId } = req.body;
    const { userId } = req.user;
    const file = req.file as Express.Multer.File;

    const userPromise = User.findOne({ where: { id: userId } });
    const productPromise = Product.findOne({ where: { name, categoryId } });
    const categoryPromise = Category.findOne({ where: { id: categoryId } });
    const [product, category, user] = await Promise.all([productPromise, categoryPromise, userPromise]);

    if (!user) {
        return output(res, 400, 'User not found', null, 'BAD_REQUEST');
    }
    if (product) {
        return output(res, 400, 'Product already exists in this category', null, 'BAD_REQUEST');
    }
    if (!category) {
        return output(res, 400, 'Category not found', null, 'BAD_REQUEST');
    }

    const newProduct = await Product.create({
        ...req.body,
        image: file.path,
        categoryId,
        userId,
    });

    return output(res, 201, 'Product created successfully', newProduct, null);
}));

// Products search and list
router.get('/', pagination, asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    const { limit, page } = res.locals.pagination;
    const orderClause = Product.getOrderQuery(req.query);
    const selectClause = Product.getSelectionQuery(req.query);
    const whereClause = Product.getWhereQuery(req.query);

    const { search } = req.query;

    // Cache key based on query params
    const cacheKey = `products:page=${page}:limit=${limit}:search=${search || ''}`;

    // Check cache
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        return output(res, 200, 'Products retrieved successfully', parsedData, null);
    }

    let finalWhereClause: WhereOptions = whereClause || {};

    if (search && (search as string).trim() !== '') {
        const searchCondition: WhereOptions = {
            name: { [Op.iLike]: `%${(search as string).trim()}%` },
        };

        finalWhereClause = whereClause
            ? { [Op.and]: [whereClause, searchCondition] }
            : searchCondition;
    }

    const products = await Product.findAndCountAll({
        order: orderClause,
        attributes: selectClause,
        where: finalWhereClause,
        limit: res.locals.pagination.limit,
        offset: res.locals.pagination.offset,
        include: [
            {
                model: Category,
                attributes: ['id', 'name'],
            },
        ],
        distinct: true,
    });

    const responseData = computePaginationRes(page, limit, products.count, products.rows);

    // Cache result for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(responseData));

    return output(res, 200, 'Products retrieved successfully', responseData, null);
}));

export default router;
