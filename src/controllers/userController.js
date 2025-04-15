import asyncHandler from '../utils/asyncHandler.js';
import { User } from '../models/userSchema.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

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
    res.status(400).json({ error: 'Avatar image is required' });
  }

  //let's upload the localImagePath to cloudinary
  const avatar = await uploadOnCloudinary(avatarImageLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    res.status(400).json({ error: 'Avatar image is required' });
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

export { registerUser };
