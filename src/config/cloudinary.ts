import { v2 as cloudinary } from "cloudinary";
import { config } from "./config";

// Configuration
cloudinary.config({
  cloud_name: config.cloudinary_cloud,
  api_key: config.cloudinary_api,
  api_secret: config.cloudinary_secret, // Click 'View API Keys' above to copy your API secret
});

export default cloudinary;
