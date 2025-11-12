/* eslint-disable sonarjs/no-duplicate-string */
import request from 'supertest';
import app from '../index';
import { Category, Product, User } from '../../src/db/models';
import redis from '../../src/config/redis';

// Mock the database models and Redis
jest.mock('../../src/db/models', () => ({
    initModels: jest.fn(),
    Product: {
        findOne: jest.fn(),
        create: jest.fn(),
        findAndCountAll: jest.fn(),
        getOrderQuery: jest.fn(() => []),
        getSelectionQuery: jest.fn(() => ['id', 'name', 'price']),
        getWhereQuery: jest.fn(() => ({})),
    },
    Category: {
        findOne: jest.fn(),
    },
    User: {
        findOne: jest.fn(),
    },
}));

jest.mock('../../src/config/redis', () => ({
    get: jest.fn(),
    setex: jest.fn(),
}));

// Mock middlewares
jest.mock('../../src/middleware/middleware', () => ({
    validate: () => (req: any, res: any, next: any) => next(),
    pagination: (req: any, res: any, next: any) => {
        res.locals.pagination = { page: 1, limit: 10, offset: 0 };
        next();
    },
}));

jest.mock('../../src/middleware/access_middleware', () => ({
    isAdmin: (req: any, res: any, next: any) => {
        req.user = { userId: '123e4567-e89b-12d3-a456-426614174000', role: 'admin' };
        next();
    },
    isUser: (req: any, res: any, next: any) => {
        req.user = { userId: '123e4567-e89b-12d3-a456-426614174000', role: 'user' };
        next();
    },
}));

jest.mock('../../src/middleware/error_middleware', () => ({
    asyncMiddleware: (fn: any) => (req: any, res: any, next: any) => {
        try {
            return fn(req, res, next);
        } catch (error) {
            next(error);
        }
    },
    jsonParseErrorHandler: (req: any, res: any, next: any) => next(),
    payloadTooLargeErrorHandler: (req: any, res: any, next: any) => next(),
    methodNotAllowedErrorHandler: (req: any, res: any, next: any) => next(),
    notFoundErrorHandler: (req: any, res: any, next: any) => next(),
    errorLogger: (req: any, res: any, next: any) => next(),
    uuidErrorHandler: (req: any, res: any, next: any) => next(),
    errorHandler: (err: any, req: any, res: any, next: any) => next(),
}));

jest.mock('../../src/utils/file_upload', () => ({
    single: () => (req: any, res: any, next: any) => {
        req.file = {
            path: 'https://res.cloudinary.com/demo/image/upload/v1234567/product.jpg',
        };
        next();
    },
}));

const mockedProduct = Product as jest.Mocked<typeof Product>;
const mockedCategory = Category as jest.Mocked<typeof Category>;
const mockedUser = User as jest.Mocked<typeof User>;
const mockedRedis = redis as jest.Mocked<typeof redis>;

describe('Product API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /products', () => {
        it('should create a new product successfully', async () => {
            const productData = {
                name: 'Test Product',
                description: 'This is a test product description',
                price: 99,
                stock: 50,
                categoryId: '123e4567-e89b-12d3-a456-426614174000',
            };

            const mockUser = { id: '123e4567-e89b-12d3-a456-426614174000' };
            const mockCategory = { id: '123e4567-e89b-12d3-a456-426614174000' };

            mockedUser.findOne.mockResolvedValue(mockUser as any);
            mockedProduct.findOne.mockResolvedValue(null);
            mockedCategory.findOne.mockResolvedValue(mockCategory as any);
            mockedProduct.create.mockResolvedValue({
                id: '123e4567-e89b-12d3-a456-426614174001',
                ...productData,
                image: 'https://res.cloudinary.com/demo/image/upload/v1234567/product.jpg',
                userId: '123e4567-e89b-12d3-a456-426614174000',
                createdAt: new Date(),
                updatedAt: new Date(),
            } as any);

            const response = await request(app)
                .post('/products')
                .field('name', productData.name)
                .field('description', productData.description)
                .field('price', productData.price.toString())
                .field('stock', productData.stock.toString())
                .field('categoryId', productData.categoryId)
                .attach('image', Buffer.from('fake image data'), 'test.jpg');

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Product created successfully');
            expect(response.body.data.name).toBe(productData.name);
        });

        it('should return 400 if product already exists in category', async () => {
            const productData = {
                name: 'Existing Product',
                description: 'This product already exists',
                price: 99,
                stock: 50,
                categoryId: '123e4567-e89b-12d3-a456-426614174000',
            };

            const mockUser = { id: '123e4567-e89b-12d3-a456-426614174000' };
            const mockCategory = { id: '123e4567-e89b-12d3-a456-426614174000' };
            const existingProduct = { id: '123e4567-e89b-12d3-a456-426614174001', ...productData };

            mockedUser.findOne.mockResolvedValue(mockUser as any);
            mockedProduct.findOne.mockResolvedValue(existingProduct as any);
            mockedCategory.findOne.mockResolvedValue(mockCategory as any);

            const response = await request(app)
                .post('/products')
                .field('name', productData.name)
                .field('description', productData.description)
                .field('price', productData.price.toString())
                .field('stock', productData.stock.toString())
                .field('categoryId', productData.categoryId)
                .attach('image', Buffer.from('fake image data'), 'test.jpg');

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Product already exists in this category');
        });
    });

    describe('GET /products', () => {
        it('should retrieve products successfully', async () => {
            const mockProducts = {
                count: 2,
                rows: [
                    {
                        id: '123e4567-e89b-12d3-a456-426614174000',
                        name: 'Product 1',
                        description: 'Description 1',
                        price: 99,
                        stock: 10,
                        image: 'image1.jpg',
                        categoryId: '123e4567-e89b-12d3-a456-426614174001',
                        userId: '123e4567-e89b-12d3-a456-426614174002',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        category: {
                            id: '123e4567-e89b-12d3-a456-426614174001',
                            name: 'Electronics',
                        },
                    },
                ],
            };

            mockedRedis.get.mockResolvedValue(null);
            mockedProduct.findAndCountAll.mockResolvedValue(mockProducts as any);
            mockedRedis.setex.mockResolvedValue('OK');

            const response = await request(app)
                .get('/products')
                .query({ page: 1, limit: 10 });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Products retrieved successfully');
            expect(response.body.data.items).toHaveLength(1);
        });

        it('should return cached data if available', async () => {
            const cachedData = {
                currentPage: 1,
                pageSize: 10,
                totalPages: 1,
                totalProducts: 1,
                products: [
                    {
                        id: '123e4567-e89b-12d3-a456-426614174000',
                        name: 'Cached Product',
                        description: 'Cached Description',
                        price: 99,
                        stock: 10,
                    },
                ],
            };

            mockedRedis.get.mockResolvedValue(JSON.stringify(cachedData));

            const response = await request(app)
                .get('/products')
                .query({ page: 1, limit: 10 });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Products retrieved successfully');
        });

        it('should search products by name', async () => {
            const mockProducts = {
                count: 1,
                rows: [
                    {
                        id: '123e4567-e89b-12d3-a456-426614174000',
                        name: 'iPhone 15',
                        description: 'Latest iPhone',
                        price: 999,
                        stock: 5,
                        image: 'iphone.jpg',
                        categoryId: '123e4567-e89b-12d3-a456-426614174001',
                        userId: '123e4567-e89b-12d3-a456-426614174002',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        category: {
                            id: '123e4567-e89b-12d3-a456-426614174001',
                            name: 'Electronics',
                        },
                    },
                ],
            };

            mockedRedis.get.mockResolvedValue(null);
            mockedProduct.findAndCountAll.mockResolvedValue(mockProducts as any);

            const response = await request(app)
                .get('/products')
                .query({ search: 'iPhone', page: 1, limit: 10 });

            expect(response.status).toBe(200);
            expect(response.body.data.items[0].name).toBe('iPhone 15');
        });
    });
});
