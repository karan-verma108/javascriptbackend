import { Router } from 'express';
import { registerUser } from '../controllers/userController.js';
import { upload } from '../middlewares/multer.js';

const router = Router();

//to handle file uploads, we're using multer as a middleware, using before registerUser method so that it can be used before the registeration
router.route('/register').post(
  upload.fields([
    {
      name: 'avatar',
      maxCount: 1,
    },
    {
      name: 'coverImage',
      maxCount: 1,
    },
  ]),
  registerUser
);

export default router;
