const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');

dotenv.config({ path: './config.env' });

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

// READ JSON FILE
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    // Passing array of JS objs
    await Tour.create(tours);
    console.log('Data successfully imported!');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    // If empty then deletes all
    await Tour.deleteMany();
    console.log('Data successfully deleted!');
    process.exit(); // Aggressive way to stop an application
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

console.log(process.argv);
