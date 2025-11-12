# E-commerce API
A robust and scalable E-commerce REST API built with modern web technologies.
This project supports product management, order handling, authentication, and caching, with clean code practices and strong test coverage.

It uses the following technologies:
- **Node** (v18.18.0)
- **Typescript** and babel for Types and js compiling
- **Express** as web framework
- **Joi** for validations: provides robust and flexible validation for incoming API requests.
- **Jest** and **supertest** for tests: ensure API reliability through automated testing.
- **Swagger** for API documentation: offers clear and interactive API documentation.
- **Redis** Improves performance by caching frequently accessed data (e.g., products).
- **Cloudinary** Manages image/file uploads and cloud storage efficiently: simplifies image management with fast CDN delivery and automatic transformations.

## Usage:
- **Setup .env** file copying `.env.example` or customizing it.

- env.example
    ```
    NODE_ENV=
    PORT=
    SERVICE_LOG_LEVEL=
    JWT_SECRET=

    # Database configuration
    E_COMMERCE_DB_HOST=
    E_COMMERCE_DB_PORT=
    E_COMMERCE_DB_NAME=
    E_COMMERCE_DB_USER=
    E_COMMERCE_DB_PASSWORD=

    # Test database configuration
    E_COMMERCE_TEST_DB_USER=
    E_COMMERCE_TEST_DB_PASSWORD=
    E_COMMERCE_TEST_DB_NAME=
    E_COMMERCE_TEST_DB_HOST=
    E_COMMERCE_TEST_DB_PORT=

    # cloudinary configuration
    CLOUDINARY_NAME=
    CLOUDINARY_API_KEY=
    CLOUDINARY_API_SECRET=

    # Admin credentials
    ADMIN_EMAIL=
    ADMIN_USERNAME=
    ADMIN_PASSWORD=

    # Redis configuration
    REDIS_HOST=
    REDIS_PORT=
    ```

- Note that you have to have Redis installed and configured on your machine and make sure it is running for the project to use caching 
    - refer to this [How to Install and configure Redis](https://naveenrenji.medium.com/install-redis-on-windows-b80880dc2a36) for installation and configuration
- **Start Redis** with `sudo service redis-server start`

- **Start services** with `npm run start-nodemon` and install dependencies with `npm install`. this will install dependencies and start server
    - Note that you will have to install the Node packages by yourself and a database to run the project.
- **Install packages** `npm install`
- **Run tests** with `npm run test` or if you use yarn `yarn run test`

Once the project is running, you can view the API documentation at `http://localhost:{Port}/api-docs/`