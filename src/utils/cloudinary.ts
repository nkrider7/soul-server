import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (filePath: string): Promise<string | undefined> => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });
    if (result) {
      fs.unlinkSync(filePath);
      return result.secure_url;
    }
  } catch (error) {
    fs.unlinkSync(filePath);
    console.log(error);
    return "";
  }
};

const deleteOnCloudinary = async (url: string, resource: string = "image") => {
  try {
    const lastSegment = url?.split("/").pop();
    const publicId = lastSegment ? lastSegment.split(".")[0] : "";
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resource,
    });
    return result;
  } catch (error) {
    console.log("Error in deleting from cloudinary");
    console.log(error);
    return error;
  }
};

export { uploadOnCloudinary, deleteOnCloudinary };