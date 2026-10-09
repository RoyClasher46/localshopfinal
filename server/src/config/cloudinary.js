import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

//--->>> READ CLOUDINARY ENV VARIABLES

const cloudName = process.env.CLOUD_NAME?.trim();
const apiKey = process.env.CLOUD_API_KEY?.trim();
const apiSecret = process.env.CLOUD_API_SECRET?.trim();

//--->>> VALIDATE

if (!cloudName) {
  throw new Error("CLOUD_NAME is missing from .env");
}

if (!apiKey) {
  throw new Error("CLOUD_API_KEY is missing from .env");
}

if (!apiSecret) {
  throw new Error("CLOUD_API_SECRET is missing from .env");
}

//--->> CONFIGURE CLOUDINARY

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export default cloudinary;
