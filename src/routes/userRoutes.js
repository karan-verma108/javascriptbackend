import { Router } from 'express';
import {
  loginUser,
  logoutUser,
  registerUser,
} from '../controllers/userController.js';
import { upload, verifyJWT } from '../middlewares';

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

router.route('/login').post(loginUser);

//secured routes , we're calling verifyJWT middleware before performing the logoutUser method
router.route('/logout', verifyJWT, logoutUser);

export default router;
