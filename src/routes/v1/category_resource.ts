import express, { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { computePaginationRes } from '../../utils';
import { pagination, validate } from '../../middleware/middleware';
import { asyncMiddleware } from '../../middleware/error_middleware';
import output from '../../utils/response';
import { isAdmin } from '../../middleware/access_middleware';
const router = express.Router({ mergeParams: true });

// model imports
import { Category } from '../../db/models';

// Category create validations
const categoryCreateValidations = Joi.object({
    name: Joi.string().required().messages({
        'string.base': 'Please provide a valid category name',
        'string.empty': 'Category is required',
    }),
});

// Create a category
router.post('/', isAdmin, validate(categoryCreateValidations), asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.body;
    const category = await Category.findOne({ where: { name } });
    if (category) {
        return output(res, 400, 'Category already exists', null, 'BAD_REQUEST');
    }
    const newCategory = await Category.create({ ...req.body });
    return output(res, 201, 'Category created successfully', newCategory, null);
})
);

// Get all categories
router.get('/', pagination, asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    const orderClause = Category.getOrderQuery(req.query);
    const selectClause = Category.getSelectionQuery(req.query);
    const whereClause = Category.getWhereQuery(req.query);

    const categories = await Category.findAndCountAll({
        order: orderClause,
        attributes: selectClause,
        where: { ...whereClause },
        limit: res.locals.pagination.limit,
        offset: res.locals.pagination.offset,
    });

    return output(
        res, 200, 'Categories retrieved successfully',
        computePaginationRes(
            res.locals.pagination.page,
            res.locals.pagination.limit,
            categories.count,
            categories.rows),
        null);
})
);

export default router;
