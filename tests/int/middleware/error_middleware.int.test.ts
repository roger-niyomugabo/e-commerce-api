import supertest from 'supertest';
import app from '../../index';

describe('int/middleware/error_middleware', () => {

    beforeAll(async () => {
        // something to do before after all tests run
    });

    afterAll(async () => {
        // something to do after all tests run
    });

    describe('middleware errorHandler', () => {
        test('throw error', async () => {
            await supertest(app).get('/test/error')
                .expect(500);
        });
    });

    describe('middleware asyncMiddleware', () => {
        test('throw error', async () => {
            await supertest(app).get('/test/error_async')
                .expect(500).then(response => {
                    expect(response.body.errors[0].msg).toBe('Internal server error');
                });
        });
    });

    describe('middleware methodNotAllowedErrorHandler', () => {
        test('return 405', async () => {
            await supertest(app).delete('/test')
                .expect(405);
        });
    });

    describe('middleware notFoundErrorHandler', () => {
        test('return 404', async () => {
            await supertest(app).get('/this-is-a-test-route')
                .expect(404);
        });
    });

    describe('middleware jsonParseErrorHandler', () => {
        test('return 400', async () => {
            await supertest(app).patch('/test')
                .send('{"invalid"}').type('json')
                .expect(400);
        });
    });

});
