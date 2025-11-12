/* eslint-disable sonarjs/no-duplicate-string */
import request from 'supertest';
import app from '../index';
import { Order, OrderItem, Product, User } from '../../src/db/models';
import { db } from '../../src/db';

// Mock the database models and db transaction
jest.mock('../../src/db/models', () => ({
    initModels: jest.fn(),
    Order: {
        create: jest.fn(),
        findAndCountAll: jest.fn(),
        getOrderQuery: jest.fn(() => []),
        getWhereQuery: jest.fn(() => ({})),
    },
    OrderItem: {
        create: jest.fn(),
        findAll: jest.fn(),
    },
    Product: {
        findOne: jest.fn(),
    },
    User: {
        findOne: jest.fn(),
    },
}));
jest.mock('../../src/db', () => ({
    db: {
        transaction: jest.fn(async (callback) => {
            const t = { commit: jest.fn(), rollback: jest.fn() };
            return callback(t);
        }),
    },
}));

const mockedOrder = Order as jest.Mocked<typeof Order>;
const mockedOrderItem = OrderItem as jest.Mocked<typeof OrderItem>;
const mockedProduct = Product as jest.Mocked<typeof Product>;
const mockedUser = User as jest.Mocked<typeof User>;
const mockedDb = db as jest.Mocked<typeof db>;

// Mock middlewares
jest.mock('../../src/middleware/middleware', () => ({
    validate: () => (req: any, res: any, next: any) => next(),
    pagination: (req: any, res: any, next: any) => {
        res.locals.pagination = { page: 1, limit: 10, offset: 0 };
        next();
    },
}));

jest.mock('../../src/middleware/access_middleware', () => ({
    isUser: (req: any, res: any, next: any) => {
        req.user = { userId: '123e4567-e89b-12d3-a456-426614174000', role: 'user' };
        next();
    },
    isAdmin: (req: any, res: any, next: any) => next(),
}));

describe('Order API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /orders', () => {
        it('should create a new order successfully', async () => {
            const orderData = {
                orderData: [
                    {
                        productId: '123e4567-e89b-12d3-a456-426614174001',
                        quantity: 2,
                        description: 'Test product',
                    },
                ],
            };

            const mockUser = { id: '123e4567-e89b-12d3-a456-426614174000' };
            const mockProduct = {
                id: '123e4567-e89b-12d3-a456-426614174001',
                name: 'Test Product',
                price: 99,
                stock: 10,
                save: jest.fn().mockResolvedValue(true),
            };

            const mockTransaction = {
                commit: jest.fn(),
                rollback: jest.fn(),
            };

            mockedUser.findOne.mockResolvedValue(mockUser as any);
            mockedDb.transaction.mockImplementation((callback: any) => callback(mockTransaction));
            mockedOrder.create.mockResolvedValue({
                id: '123e4567-e89b-12d3-a456-426614174002',
                userId: '123e4567-e89b-12d3-a456-426614174000',
                totalPrice: 0,
                status: 'pending',
                save: jest.fn().mockResolvedValue(true),
            } as any);
            mockedProduct.findOne.mockResolvedValue(mockProduct as any);
            mockedOrderItem.create.mockResolvedValue({} as any);
            mockedOrderItem.findAll.mockResolvedValue([
                {
                    product: mockProduct,
                    quantity: 2,
                },
            ] as any);

            const response = await request(app)
                .post('/orders')
                .send(orderData);

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Order created successfully');
            expect(response.body.data.orderId).toBeDefined();
            expect(response.body.data.totalPrice).toBe(198);
            expect(response.body.data.status).toBe('pending');
        });

        it('should return 400 for empty order data', async () => {
            const emptyOrderData = {
                orderData: [],
            };

            const mockUser = { id: '123e4567-e89b-12d3-a456-426614174000' };

            mockedUser.findOne.mockResolvedValue(mockUser as any);

            const response = await request(app)
                .post('/orders')
                .send(emptyOrderData);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Invalid request. Must be a non-empty array of products.');
        });

        it('should return 404 if product not found', async () => {
            const orderData = {
                orderData: [
                    {
                        productId: 'nonexistent-product-id',
                        quantity: 1,
                    },
                ],
            };

            const mockUser = { id: '123e4567-e89b-12d3-a456-426614174000' };
            const mockTransaction = {
                commit: jest.fn(),
                rollback: jest.fn(),
            };

            mockedUser.findOne.mockResolvedValue(mockUser as any);
            mockedDb.transaction.mockImplementation((callback: any) => callback(mockTransaction));
            mockedOrder.create.mockResolvedValue({
                id: '123e4567-e89b-12d3-a456-426614174002',
                userId: '123e4567-e89b-12d3-a456-426614174000',
                totalPrice: 0,
                status: 'pending',
            } as any);
            mockedProduct.findOne.mockResolvedValue(null);

            const response = await request(app)
                .post('/orders')
                .send(orderData);

            expect(response.status).toBe(404);
            expect(response.body.message).toContain('Product not found');
        });

        it('should return 400 for insufficient stock', async () => {
            const orderData = {
                orderData: [
                    {
                        productId: '123e4567-e89b-12d3-a456-426614174001',
                        quantity: 10,
                    },
                ],
            };

            const mockUser = { id: '123e4567-e89b-12d3-a456-426614174000' };
            const mockProduct = {
                id: '123e4567-e89b-12d3-a456-426614174001',
                name: 'Test Product',
                price: 99,
                stock: 5,
            };

            const mockTransaction = {
                commit: jest.fn(),
                rollback: jest.fn(),
            };

            mockedUser.findOne.mockResolvedValue(mockUser as any);
            mockedDb.transaction.mockImplementation((callback: any) => callback(mockTransaction));
            mockedOrder.create.mockResolvedValue({
                id: '123e4567-e89b-12d3-a456-426614174002',
                userId: '123e4567-e89b-12d3-a456-426614174000',
                totalPrice: 0,
                status: 'pending',
            } as any);
            mockedProduct.findOne.mockResolvedValue(mockProduct as any);

            const response = await request(app)
                .post('/orders')
                .send(orderData);

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('Insufficient stock');
        });
    });

    describe('GET /orders', () => {
        it('should retrieve user orders successfully', async () => {
            const mockOrders = {
                count: 2,
                rows: [
                    {
                        id: '123e4567-e89b-12d3-a456-426614174000',
                        totalPrice: 198,
                        status: 'pending',
                        createdAt: new Date(),
                        orderItems: [
                            {
                                id: '123e4567-e89b-12d3-a456-426614174001',
                                quantity: 2,
                                product: {
                                    id: '123e4567-e89b-12d3-a456-426614174002',
                                    name: 'Test Product',
                                    price: 99,
                                },
                            },
                        ],
                    },
                ],
            };

            const mockUser = { id: '123e4567-e89b-12d3-a456-426614174000' };

            mockedUser.findOne.mockResolvedValue(mockUser as any);
            mockedOrder.findAndCountAll.mockResolvedValue(mockOrders as any);

            const response = await request(app)
                .get('/orders')
                .query({ page: 1, limit: 10 });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Orders retrieved successfully');
        });

        it('should return 404 if user not found', async () => {
            mockedUser.findOne.mockResolvedValue(null);

            const response = await request(app)
                .get('/orders')
                .query({ page: 1, limit: 10 });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('User not found');
        });
    });
});
