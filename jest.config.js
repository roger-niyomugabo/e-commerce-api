/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    globalSetup: './tests/suiteSetup.ts',
    globalTeardown: './tests/suiteTeardown.ts',
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
};
