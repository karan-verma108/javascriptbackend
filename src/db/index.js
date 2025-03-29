import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

const connectToDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB!');
  } catch (error) {
    console.error('ERROR : ', error);
  }
};

export default connectToDB;
