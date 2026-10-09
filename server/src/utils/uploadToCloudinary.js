import cloudinary from "../config/cloudinary.js";

//--->>> UPLOAD BUFFER TO CLOUDINARY

const uploadToCloudinary = (buffer, folder = "shoplocal/shops") => {
  return new Promise((resolve, reject) => {
    if (!buffer || !Buffer.isBuffer(buffer)) {
      return reject(
        new Error("No valid image buffer was provided to Cloudinary."),
      );
    }

    //--->>> CLOUDINARY CONFIG CHECK

    const config = cloudinary.config();

    if (!config.cloud_name) {
      return reject(new Error("Cloudinary cloud name is not configured."));
    }

    if (!config.api_key) {
      return reject(new Error("Cloudinary API key is not configured."));
    }

    if (!config.api_secret) {
      return reject(new Error("Cloudinary API secret is not configured."));
    }

    //-->>> UPLOAD STREAM

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },

      (error, result) => {
        //-->>> CLOUDINARY ERROR

        if (error) {
          console.error("Cloudinary upload error:", error);

          return reject(error);
        }

        if (!result) {
          return reject(
            new Error("Cloudinary returned an empty upload result."),
          );
        }

        if (!result.secure_url) {
          return reject(
            new Error(
              "Cloudinary upload succeeded but no secure URL was returned.",
            ),
          );
        }

        //--->>> SUCCESS

        return resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      },
    );

    //-->>> STREAM ERROR

    uploadStream.on("error", (error) => {
      console.error("Cloudinary upload stream error:", error);

      reject(error);
    });

    //--->>> SEND BUFFER

    uploadStream.end(buffer);
  });
};

export default uploadToCloudinary;
