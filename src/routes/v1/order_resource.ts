import express, { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import { isUser } from '../../middleware/access_middleware';
import { validate } from '../../middleware/middleware';
import { Order, OrderItem, Product, User } from '../../db/models';
import { asyncMiddleware } from '../../middleware/error_middleware';
import output from '../../utils/response';
import { OrderItemType } from '../../interfaces/orderInterface';
import { db } from '../../db';

const router = express.Router();

const productValidations = Joi.object({
    productId: Joi.string().uuid().required(),
    quantity: Joi.number().required(),
    description: Joi.string().optional(),
});

const productSoldValidations = Joi.object({
    orderData: Joi.array().items(productValidations),
});

// Create an order
router.post('/', isUser, validate(productSoldValidations), asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.user;
    const { orderData } = req.body;

    const userExist = await User.findOne({ where: { id: userId } });
    if (!userExist) {
        return output(res, 404, 'User not found', null, 'NOT_FOUND');
    }

    if (orderData.length === 0) {
        return output(res, 400, 'Invalid request. Must be a non-empty array of products.', null, 'BAD_REQUEST');
    }

    const products: OrderItemType[] = orderData;

    const newOrder = await db.transaction(async (t) => {
        let totalPrice = 0;

        const order = await Order.create(
            {
                userId,
                totalPrice: 0,
                status: 'pending',
            },
            { transaction: t }
        );

        for (const productObj of products) {
            const productExist = await Product.findOne({ where: { id: productObj.productId }, transaction: t });

            if (!productExist) {
                return output(res, 404, `Product not found: ${productObj.productId}`, null, 'NOT_FOUND');
            }

            if (productExist.stock < productObj.quantity) {
                return output(res, 400, `Insufficient stock for product: ${productExist.name}`, null, 'BAD_REQUEST');
            }

            productExist.stock -= productObj.quantity;
            await productExist.save({ transaction: t });

            const subtotal = productExist.price * productObj.quantity;
            totalPrice += subtotal;

            await OrderItem.create(
                {
                    orderId: order.id,
                    productId: productExist.id,
                    quantity: productObj.quantity,
                },
                { transaction: t }
            );
        }

        order.totalPrice = totalPrice;
        await order.save({ transaction: t });

        const orderItems = await OrderItem.findAll({
            where: { orderId: order.id },
            include: [{ model: Product, attributes: ['id', 'name', 'price'] }],
            transaction: t,
        });

        return {
            orderId: order.id,
            totalPrice: order.totalPrice,
            status: order.status,
            products: orderItems.map((item) => ({
                id: item.product.id,
                name: item.product.name,
                price: item.product.price,
                quantity: item.quantity,
            })),
        };
    });

    return output(res, 201, 'Order created successfully', newOrder, null);
})
);

export default router;
