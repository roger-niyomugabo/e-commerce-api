import { Sequelize } from 'sequelize';
import { db_config } from '../config/db_config';
import { logger } from '../services/logger';
import { initModels } from './models';

const config = db_config[process.env.NODE_ENV];

// Get DB credentials
// Connection with the DB
const db = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    port: config.port,
    logging: false,
});

// Check DB connection
db
    .authenticate()
    .then(() => {
        if (process.env.NODE_ENV !== 'test') {
            logger.info('Database connection established successfully.');
        }
    })
    .catch((err) => {
        logger.error({ message: 'Unable to connect to the database:', meta: { error: err } });
    });

// Init models
initModels(db);

export { db };
