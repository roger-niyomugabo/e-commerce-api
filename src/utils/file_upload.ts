import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import config from '../config';

cloudinary.config({
    cloud_name: config.storage.cloudinary_name,
    api_key: config.storage.cloudinary_api_key,
    api_secret: config.storage.cloudinary_api_secret,
});

const storage = new CloudinaryStorage({
    cloudinary,
});

const cloudinaryUpload = multer({
    storage,
    fileFilter: (req, file: Express.Multer.File, cb) => {
        return cb(null, true);
    },
});

export default cloudinaryUpload;
