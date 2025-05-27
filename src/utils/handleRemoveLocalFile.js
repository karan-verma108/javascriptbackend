import { unlink } from 'fs/promises';

export const hanldeRemoveLocalFile = async (localFilePath) => {
  try {
    if (!localFilePath) {
      return null;
    }

    await unlink(localFilePath);
  } catch (error) {
    console.log('Error removing the file', error);
  }
};
