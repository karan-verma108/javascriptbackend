import { Router } from 'express';
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from '../controllers/userController.js';
import { upload } from '../middlewares/multer.js';
import { verifyJWT } from '../middlewares/auth.js';

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
router.route('/logout').post(verifyJWT, logoutUser);
router.route('/refresh-token').post(refreshAccessToken);

export default router;
