import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import { User } from '../models/userSchema.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { options } from '../contants.js';

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    //adding refresh token field to the user of the userId we found from mongodb
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    return {
      success: false,
      error: 'Token generation failed',
    };
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //let's take values from the frontend (from postman for the time being)
  const { userName, email, fullName, password } = req.body;

  //now adding validation if any field is empty
  if (
    [userName, email, fullName, password].some((field) => field?.length === 0)
  ) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  //testing if the entered email is a valid email
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!regex.test(email)) {
    return res.status(400).json({ error: 'Email must be valid' });
  }

  //now checking if the user already exists in the db
  const userExists = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (userExists) {
    return res.status(409).json({ error: 'User already exists' });
  }

  //now let's check if we got the uploaded images on the local using multer or not
  const avatarImageLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarImageLocalPath) {
    return res
      .status(400)
      .json({ error: 'Avatar image is required from multer' });
  }

  //let's upload the localImagePath to cloudinary
  const avatar = await uploadOnCloudinary(avatarImageLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    return res
      .status(400)
      .json({ error: 'Avatar image is required from cloudinary' });
  }

  //let's create a document in our db using the values of the user we got above (using Collection.Create() method)
  const user = await User.create({
    userName,
    avatar: avatar?.url,
    coverImage: coverImage?.url ?? '',
    email,
    password,
    fullName,
  });

  //let's remove password and refreshToken fields from the response as we don't want to show that to the user
  const userCreatedInDb = await User.findById(user?._id).select(
    '-password -refreshToken'
  );

  if (!userCreatedInDb) {
    return res
      .status(500)
      .json({ error: 'Something went wrong while registering the user' });
  }

  res.status(201).json({
    userCreatedInDb,
  });
});

const loginUser = asyncHandler(async (req, res) => {
  //let's check if we got data in req.body or not
  const { userName, email, password } = req.body;

  //checking if username or email is missing from user
  if (!userName || !email) {
    return res.status(400).json({ error: 'Username or email is required' });
  }

  //let's find the user based on username or email given by user
  const user = await User.findOne({
    $or: [
      {
        userName,
      },
      { email },
    ],
  });

  if (!user) {
    return res.status(404).json({ error: 'User does not exist' });
  }

  //checking if the password matches with the saved password in the db
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    return res
      .status(401)
      .json({ error: 'Invalid credentials, please try again' }); //401 - unauthorized
  }

  //generating access and refresh tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  //updating the response user to exclude password and refresh token fields
  const loggedInUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );

  //let's send cookies

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json({
      message: 'User logged in successfully!',
      user: loggedInUser,
      accessToken,
      refreshToken,
    });
});

const logoutUser = asyncHandler(async (req, res) => {
  //lets update the refreshToken field in the db by resetting it
  //we got the res.user because earlier in the verifyJWT middleware we added the user object to the req object
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  //lets delete the cookies now

  return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json({ message: 'User logged out' });
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  //let's get the refresh token from the client (user)
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }

  try {
    // now, let's verify the incoming refresh token
    const decodedRefreshToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // now, since we got the decoded refresh token, meaning that now we have access to any payload (data) it was assigned while its creation (in this case, the _id), so we can use that _id to make a query to the db and get the user whose _id matches with this _id and eventually get their refresh token from the db
    const user = await User.findById(decodedRefreshToken?._id);

    //now if user doens't exist meaning that the refresh token is not preent in the db so we'll give an error response
    if (!user) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    //checking the incoming refresh token and comparing it with the refresh token obtained from the user (coming from db)
    if (incomingRefreshToken !== user?.refreshToken) {
      return res.status(401).json({ error: 'Refresh token expired or used' });
    }

    //assuming that the tokens have been compared and it's the same so let's generate the new access and refresh tokens
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user?._id);

    res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', newRefreshToken, options)
      .json({
        accessToken,
        refreshToken: newRefreshToken,
        message: 'Access token refreshed',
      });
  } catch (error) {
    res.status(401).json({ error: error?.message || 'Invalid refresh token' });
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);

  if (!user) {
    res.status(404).json({ error: 'User does not exist' });
  }
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    return res.status(400).json({ error: 'Invalid old password' });
  }

  user.password = newPassword; //when isPasswordCorrect is true so we'll re-assign password in user object to newPassword
  await user.save({ validateBeforeSave: false }); //to avoid unnecessary validations

  return res.status(200).json({ message: 'Password updated successfully!' });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(404).json({ error: 'User does not exist' });
  }

  return res
    .status(200)
    .json({ message: 'Current user fetched successfully!', user });
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    return res.status(400).json({ error: 'All fields are mandatory' });
  }

  //now we're going to update the fullName and email field
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName, //we can write like this (new syntax)
        email: email, //we can write like this too (old syntax)
      },
    },
    { new: true } // tells Mongoose to return the updated document, not the old one. So if we dont' write the {new : true} so even after update, mongoose will return the document as it was before update (old values)
  ).select('-password');

  if (!user) {
    return res.status(404).json({ error: 'User does not exist' });
  }

  return res
    .status(200)
    .json({ message: 'Account details updated successfully!', user });
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
};
