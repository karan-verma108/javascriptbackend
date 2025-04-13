import 'dotenv/config';
import connectToDB from './db/index.js';
import { app } from './app.js';
const PORT = process.env.PORT || 4000;

connectToDB()
  .then(() => {
    app.on('error', (error) => {
      console.error(
        'Some error occured after connecting to the database',
        error
      );
    });
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => console.error('ERROR connecting to the database', err));
