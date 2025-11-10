/* eslint-disable sonarjs/no-duplicate-string */
import supertest from 'supertest';
import app from '../../index';

describe('int/middleware/middleware', () => {

    beforeAll(async () => {
        // something to do before after all tests run
    });

    afterAll(async () => {
        // something to do after all tests run
    });

    describe('middleware validate', () => {
        test('body required ok', async () => {
            await supertest(app).patch('/test/validator_two')
                .expect(422);

            await supertest(app).patch('/test/validator_two')
                .send({ name: 'test' })
                .expect(200);

            await supertest(app).patch('/test/validator_two')
                .send({ other: 'test' })
                .expect(422);
        });

        test('body not required', async () => {
            await supertest(app).patch('/test/validator_one')
                .expect(200);
        });

        test('correct trimming of undesired properties', async () => {
            await supertest(app).patch('/test/validator_one')
                .send({ other: 'test', name: 'test' })
                .expect(200).then(response => {
                    expect(response.body.req.body.other).toBe(undefined);
                    expect(response.body.req.body.name).toBe('test');
                });
        });

        test('no trimming on array properties', async () => {
            await supertest(app).patch('/test/validator_two')
                .send({ other: 'test', name: 'test', someArray: ['one', 'two', 'three'] })
                .expect(422);

            await supertest(app).patch('/test/validator_two')
                .send({ other: 'test', name: 'test', someArray: ['one', 'two'] })
                .expect(200);
        });
    });

    describe('middleware pagination', () => {
        test('pagination ok', async () => {
            await supertest(app).get('/test')
                .expect(200).then(response => {
                    expect(response.body.res.locals.pagination.limit).toBe(20);
                    expect(response.body.res.locals.pagination.offset).toBe(0);
                    expect(response.body.res.locals.pagination.page).toBe(1);
                });

            await supertest(app).get('/test?count=5&page=2')
                .expect(200).then(response => {
                    expect(response.body.res.locals.pagination.limit).toBe(5);
                    expect(response.body.res.locals.pagination.offset).toBe(5);
                    expect(response.body.res.locals.pagination.page).toBe(2);
                });

            await supertest(app).get('/test?count=10&page=3')
                .expect(200).then(response => {
                    expect(response.body.res.locals.pagination.limit).toBe(10);
                    expect(response.body.res.locals.pagination.offset).toBe(20);
                    expect(response.body.res.locals.pagination.page).toBe(3);
                });
        });
    });
});
