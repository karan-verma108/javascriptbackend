import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    //upload local file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
    });

    //file has been uploaded successfully, so let's log the response url in console
    // console.log('file uploaded! ', response);

    //let's remove the file from the local server as we no longer want to save the files on the server onces they are uploaded to cloudinary
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); //this method fs.unlinkSync(), deletes the file syncronously, removing the locally saved file as the operation to upload that file on cloudinary got failed
    return null;
  }
};

export { uploadOnCloudinary };
