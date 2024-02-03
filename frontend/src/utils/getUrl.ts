import axios from 'axios';
import { CLOUDINARY_API_KEY, CLOUD_NAME, UPLOAD_PRESET } from './url';

export async function getUrl(file: File, type: 'video'): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('api_key', CLOUDINARY_API_KEY);

  try {
    const response = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${type}/upload`, formData);
    return response.data.secure_url;
  } catch (error) {
    console.error('Error uploading file to Cloudinary:', error);
    throw error;
  }
}