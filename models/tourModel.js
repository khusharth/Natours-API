const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    // Schema type options
    type: String,
    required: [true, 'A tour must have a name'], // validator
    unique: true, // We cant have two tour documents with same name
    trim: true,
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a group size'],
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty'],
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
  priceDiscount: Number,
  summary: {
    type: String,
    trim: true, // Removes all the whitespace from the start and end.
    required: [true, 'A tour must have a summary'],
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String, // Name of the image that we will read from Filesystem
    required: [true, 'A tour must have a cover image'],
  },
  images: [String], // An Array of strings
  createdAt: {
    type: Date,
    default: Date.now(), // Timestamp in miliseconds -> converted to todays date in mongoose
  },
  startDates: [Date],
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
