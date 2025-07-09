import { v2 as cloudinary } from "cloudinary";
import { config } from "../config/app.config";

cloudinary.config({
  cloud_name: config.CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});

export default cloudinary;
