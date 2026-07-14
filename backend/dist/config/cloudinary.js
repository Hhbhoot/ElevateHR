import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';
// Configure Cloudinary SDK
cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUDNAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_SECRET,
});
/**
 * Uploads a file buffer directly to Cloudinary using a stream.
 * @param fileBuffer The in-memory buffer of the uploaded file
 * @param folder Cloudinary folder designation
 * @returns Secure URL string of the uploaded asset
 */
export const uploadToCloudinary = (fileBuffer, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({
            folder,
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
            transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }], // Auto-crop profile photos around faces!
        }, (error, result) => {
            if (error) {
                return reject(error);
            }
            if (!result) {
                return reject(new Error('Cloudinary upload returned empty result'));
            }
            resolve(result.secure_url);
        });
        // Write buffer stream to upload
        stream.end(fileBuffer);
    });
};
export default cloudinary;
