/* eslint-disable sonarjs/no-duplicate-string */
import request from 'supertest';
import app from '../index';
import { Category } from '../../src/db/models';

// Mock the database models and helpers
jest.mock('../../src/db/models', () => ({
    initModels: jest.fn(),
    Category: {
        findOne: jest.fn(),
        create: jest.fn(),
        findAndCountAll: jest.fn(),
        getOrderQuery: jest.fn(() => []),
        getSelectionQuery: jest.fn(() => ['id', 'name']),
        getWhereQuery: jest.fn(() => ({})),
    },
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
    isUser: (req: any, res: any, next: any) => next(),
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

const mockedCategory = Category as jest.Mocked<typeof Category>;

describe('Category API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /category', () => {
        it('should create a new category successfully', async () => {
            const categoryData = {
                name: 'Electronics',
            };

            mockedCategory.findOne.mockResolvedValue(null);
            mockedCategory.create.mockResolvedValue({
                id: '123e4567-e89b-12d3-a456-426614174000',
                ...categoryData,
                createdAt: new Date(),
                updatedAt: new Date(),
            } as any);

            const response = await request(app)
                .post('/category')
                .send(categoryData);

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Category created successfully');
            expect(response.body.data.name).toBe(categoryData.name);
        });

        it('should return 400 if category already exists', async () => {
            const categoryData = {
                name: 'Existing Category',
            };

            mockedCategory.findOne.mockResolvedValue({
                id: '123e4567-e89b-12d3-a456-426614174000',
                ...categoryData,
            } as any);

            const response = await request(app)
                .post('/category')
                .send(categoryData);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Category already exists');
        });
    });

    describe('GET /category', () => {
        it('should retrieve categories successfully', async () => {
            const mockCategories = {
                count: 2,
                rows: [
                    {
                        id: '123e4567-e89b-12d3-a456-426614174000',
                        name: 'Electronics',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    {
                        id: '123e4567-e89b-12d3-a456-426614174001',
                        name: 'Clothing',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                ],
            };

            mockedCategory.findAndCountAll.mockResolvedValue(mockCategories as any);

            const response = await request(app)
                .get('/category')
                .query({ page: 1, limit: 10 });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Categories retrieved successfully');
            expect(response.body.data.items).toHaveLength(2);
        });
    });
});
