import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

const connectToDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Database connection is succesfull!');
  } catch (error) {
    console.error('ERROR : ', error);
    process.exit(1);
  }
};

export default connectToDB;
