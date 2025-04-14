import asyncHandler from '../utils/asyncHandler.js';
import { User } from '../models/userSchema.js';

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

  res.status(200).json({
    message: 'success',
    email: email,
  });
});

export { registerUser };
