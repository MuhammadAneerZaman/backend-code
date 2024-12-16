import { config as conf } from "dotenv"

conf();

const _config = {
    port: process.env.PORT,
    databaseUrl: process.env.DATABASE_URL,
    env: process.env.NODE_ENV,
    jwt_secret: process.env.JWT_SECRET,
    cloudinary_cloud:process.env.CLOUDINARY_NAME,
    cloudinary_api:process.env.CLOUDINARY_API_KEY,
    cloudinary_secret:process.env.CLOUDINARY_API_SECRET,
    cors_origin:process.env.CORS_ORIGIN

};

export const config = Object.freeze(_config);