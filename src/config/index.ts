import dotenv from 'dotenv';
dotenv.config();

export default {
    requiredEnvVars: [
        'FRONTEND_URL',
        'JWT_SECRET',
        'CLOUDINARY_NAME',
        'CLOUDINARY_API_KEY',
        'CLOUDINARY_API_SECRET',
    ],
    JWT_SECRET: process.env.JWT_SECRET,
    client: {
        frontend_url: process.env.FRONTEND_URL,
    },
    storage: {
        cloudinary_name: process.env.CLOUDINARY_NAME,
        cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
        cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
        requestBodyPayloadSizeLimit: parseInt(process.env.REQUEST_BODY_PAYLOAD_SIZE_LIMIT) || 5242880, // in bytes

    },
    logs: {
        level: process.env.SERVICE_LOG_LEVEL || 'info',
        requestBodyBlacklist: process.env.SERVICE_LOG_REQUEST_BODY_BLACKLIST?.split(',') || [],
        requestHeaderBlacklist: process.env.SERVICE_LOG_REQUEST_HEADER_BLACKLIST?.split(',') || [],
    },
};
