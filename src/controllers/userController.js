import asyncHandler from '../utils/asyncHandler.js';
import { User } from '../models/userSchema.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

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
    res.status(500).json({
      error: 'Something went wrong while generating refresh and access tokens',
    });
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
    res.status(409).json({ error: 'User already exists' });
  }

  //now let's check if we got the uploaded images on the local using multer or not
  const avatarImageLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarImageLocalPath) {
    res.status(400).json({ error: 'Avatar image is required from multer' });
  }

  //let's upload the localImagePath to cloudinary
  const avatar = await uploadOnCloudinary(avatarImageLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    res.status(400).json({ error: 'Avatar image is required from cloudinary' });
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
    res
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
    res.status(401).json({ error: 'Invalid credentials, please try again' }); //401 - unauthorized
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
  const options = {
    httpOnly: true,
    secure: true,
  };

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

export { registerUser };
