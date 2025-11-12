/* eslint-disable sonarjs/no-duplicate-string */
import request from 'supertest';
import app from '../index';
import { Product, User } from '../../src/db/models';

// Mock the database models
jest.mock('../../src/db/models');

const mockedProduct = Product as jest.Mocked<typeof Product>;
const mockedUser = User as jest.Mocked<typeof User>;

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

describe('Product Detail API', () => {
    const productId = '123e4567-e89b-12d3-a456-426614174000';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /products/:productId', () => {
        it('should retrieve product details successfully', async () => {
            const mockProduct = {
                id: productId,
                name: 'Test Product',
                description: 'Test Description',
                price: 99,
                stock: 50,
                image: 'test.jpg',
                categoryId: '123e4567-e89b-12d3-a456-426614174001',
                userId: '123e4567-e89b-12d3-a456-426614174002',
                createdAt: new Date(),
                updatedAt: new Date(),
                category: {
                    id: '123e4567-e89b-12d3-a456-426614174001',
                    name: 'Electronics',
                },
            };

            mockedProduct.findOne.mockResolvedValue(mockProduct as any);

            const response = await request(app)
                .get(`/products/${productId}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Product retrieved successfully');
            expect(response.body.data.name).toBe('Test Product');
            expect(response.body.data.category.name).toBe('Electronics');
        });

        it('should return 404 if product not found', async () => {
            mockedProduct.findOne.mockResolvedValue(null);

            const response = await request(app)
                .get(`/products/${productId}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Product not found');
        });
    });

    describe('PUT /products/:productId', () => {
        it('should update product successfully', async () => {
            const updateData = {
                name: 'Updated Product',
                description: 'Updated description for the product',
                price: 149,
                stock: 75,
                categoryId: '123e4567-e89b-12d3-a456-426614174001',
            };

            const mockUser = { id: '123e4567-e89b-12d3-a456-426614174000' };

            const mockProduct = {
                id: productId,
                ...updateData,
                update: jest.fn().mockResolvedValue({
                    id: productId,
                    ...updateData,
                }),
            };

            mockedUser.findOne.mockResolvedValue(mockUser as any);
            mockedProduct.findOne
                .mockResolvedValueOnce(mockProduct as any) // First call for productExist
                .mockResolvedValueOnce({ ...mockProduct, ...updateData } as any); // Second call for updated product

            const response = await request(app)
                .put(`/products/${productId}`)
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Product updated successfully');
        });

        it('should return 404 if product not found during update', async () => {
            const updateData = {
                name: 'Updated Product',
                description: 'Updated description',
                price: 149,
                stock: 75,
                categoryId: '123e4567-e89b-12d3-a456-426614174001',
            };

            const mockUser = { id: '123e4567-e89b-12d3-a456-426614174000' };

            mockedUser.findOne.mockResolvedValue(mockUser as any);
            mockedProduct.findOne.mockResolvedValue(null);

            const response = await request(app)
                .put(`/products/${productId}`)
                .send(updateData);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Product does not exist');
        });
    });

    describe('DELETE /products/:productId', () => {
        it('should delete product successfully', async () => {
            const mockProduct = {
                id: productId,
                name: 'Test Product',
                destroy: jest.fn().mockResolvedValue(1),
            };

            mockedProduct.findOne.mockResolvedValue(mockProduct as any);

            const response = await request(app)
                .delete(`/products/${productId}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Product deleted successfully');
            expect(response.body.data).toBeNull();
        });

        it('should return 404 if product not found during deletion', async () => {
            mockedProduct.findOne.mockResolvedValue(null);

            const response = await request(app)
                .delete(`/products/${productId}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Product not found');
        });
    });
});
