import asyncHandler from '../utils/asyncHandler';
import jwt from 'jsonwebtoken';
import { User } from '../models/userSchema';

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    //lets get the access token first
    const token =
      req.cookies?.accessToken ||
      req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ error: 'Unauthorized request' });
    }

    //now when we have token so need to verify if this token is equal to our token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    //lets check if this decoded token's _id exists in our db
    const user = await User.findById(decodedToken?._id).select(
      '-password -refreshToken'
    );

    //if decoded token's _id doens't exist
    if (!user) {
      res.status(401).json({ error: 'Invalid access token' });
    }

    //so now this user is present so we will add a new object to this request object
    req.user = user;
    next();
  } catch (error) {
    res
      .status(401)
      .json({ error: error?.message || 'Invalid access token in catch' });
  }
});
