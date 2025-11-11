import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

export const setupSwagger = (app: Express): void => {
    const options = {
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'E-Commerce API',
                version: '1.0.0',
                description: 'API documentation for the e-commerce backend',
            },
            servers: [
                {
                    url: 'http://localhost:3000',
                    description: 'Local server',
                },
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                    },
                },
            },
        },
        apis: ['./src/docs/paths/*.yaml', './src/docs/schemas/*.yaml'],
    };

    const swaggerSpec = swaggerJSDoc(options);

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
