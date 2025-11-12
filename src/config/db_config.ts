import dotenv from 'dotenv';
dotenv.config();
// Config for the DB and the Sequelize CLI
const db_config = {
    'development': {
        'username': process.env.E_COMMERCE_DB_USER || 'postgres',
        'password': process.env.E_COMMERCE_DB_PASSWORD || 'postgres',
        'database': process.env.E_COMMERCE_DB_NAME || 'e_commerce_db',
        'host': process.env.E_COMMERCE_DB_HOST || 'localhost',
        'port': parseInt(process.env.E_COMMERCE_DB_PORT || '5432'),
        'dialect': 'postgres',
    },
    // Hardcode test_env vars so test functions do not get into any other system
    'test': {
        'username': process.env.E_COMMERCE_TEST_DB_USER || 'postgres',
        'password': process.env.E_COMMERCE_TEST_DB_PASSWORD || 'postgres',
        'database': process.env.E_COMMERCE_TEST_DB_NAME || 'e_commerce_db',
        'host': process.env.E_COMMERCE_TEST_DB_HOST || 'localhost',
        'port': parseInt(process.env.E_COMMERCE_TEST_DB_PORT || '5432'),
        'dialect': 'postgres',
    },
    'production': {
        'username': process.env.E_COMMERCE_DB_USER,
        'password': process.env.E_COMMERCE_DB_PASSWORD,
        'database': process.env.E_COMMERCE_DB_NAME,
        'host': process.env.E_COMMERCE_DB_HOST,
        'port': parseInt(process.env.E_COMMERCE_DB_PORT),
        'dialect': 'postgres',
    },
};

export { db_config };
