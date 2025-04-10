import multer from 'multer';

const storage = multer.diskStorage({
  //local server refers to my local machine where the node.js server is running (my own laptop), so multer is storing the uploaded file on my laptop (local server)
  destination: function (req, file, cb) {
    cb(null, './public/temp');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage: storage });
