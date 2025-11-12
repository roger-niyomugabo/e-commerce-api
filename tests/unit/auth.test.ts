/* eslint-disable sonarjs/no-duplicate-string */
import request from 'supertest';
import app from '../index';
import { User } from '../../src/db/models';
import { check, generate } from '../../src/utils/bcrypt';
import { sign } from '../../src/utils/jwt';

// Mock the database models and utilities
jest.mock('../../src/db/models');
jest.mock('../../src/utils/bcrypt');
jest.mock('../../src/utils/jwt');

const mockedUser = User as jest.Mocked<typeof User>;
const mockedGenerate = generate as jest.MockedFunction<typeof generate>;
const mockedCheck = check as jest.MockedFunction<typeof check>;
const mockedSign = sign as jest.MockedFunction<typeof sign>;

describe('Auth API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /auth/register', () => {
        it('should register a new user successfully', async () => {
            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'Test123!',
            };

            mockedUser.findOne.mockResolvedValue(null);
            mockedGenerate.mockResolvedValue('hashedPassword');
            mockedUser.create.mockResolvedValue({
                id: '123e4567-e89b-12d3-a456-426614174000',
                ...userData,
                password: 'hashedPassword',
                role: 'user',
                createdAt: new Date(),
                updatedAt: new Date(),
            } as any);

            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Signed up successfully');
            expect(response.body.data.username).toBe(userData.username);
            expect(response.body.data.email).toBe(userData.email);
            expect(response.body.data.password).toBeUndefined();
        });

        it('should return 400 if user already exists', async () => {
            const userData = {
                username: 'existinguser',
                email: 'existing@example.com',
                password: 'Test123!',
            };

            mockedUser.findOne.mockResolvedValue({
                id: '123e4567-e89b-12d3-a456-426614174000',
                ...userData,
            } as any);

            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Email or username already exists');
        });

        it('should return 400 for invalid data', async () => {
            const invalidData = {
                username: 'test user',
                email: 'invalid-email',
                password: 'weak',
            };

            const response = await request(app)
                .post('/auth/register')
                .send(invalidData);

            expect(response.status).toBe(400);
        });
    });

    describe('POST /auth/login', () => {
        it('should login user successfully', async () => {
            const loginData = {
                email: 'test@example.com',
                password: 'Test123!',
            };

            const mockUser = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                username: 'testuser',
                email: 'test@example.com',
                password: 'hashedPassword',
                role: 'user',
            };

            mockedUser.findOne.mockResolvedValue(mockUser as any);
            mockedCheck.mockReturnValue(true);
            mockedSign.mockReturnValue('mock-jwt-token');

            const response = await request(app)
                .post('/auth/login')
                .send(loginData);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Logged in successfully');
            expect(response.body.data.token).toBe('mock-jwt-token');
        });

        it('should return 400 if email not registered', async () => {
            const loginData = {
                email: 'nonexistent@example.com',
                password: 'Test123!',
            };

            mockedUser.findOne.mockResolvedValue(null);

            const response = await request(app)
                .post('/auth/login')
                .send(loginData);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Email not registered');
        });

        it('should return 401 for invalid credentials', async () => {
            const loginData = {
                email: 'test@example.com',
                password: 'WrongPassword123!',
            };

            const mockUser = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                username: 'testuser',
                email: 'test@example.com',
                password: 'hashedPassword',
                role: 'user',
            };

            mockedUser.findOne.mockResolvedValue(mockUser as any);
            mockedCheck.mockReturnValue(false);

            const response = await request(app)
                .post('/auth/login')
                .send(loginData);

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Invalid credentials');
        });
    });
});
