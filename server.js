const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// connect method returns a promise
mongoose
  .connect(DB, {
    // To deal with some depreciation warnings
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  }) // promise gets access to the connection object
  .then(() => console.log('DB connection successful'));

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
