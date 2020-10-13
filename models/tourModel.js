const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      // Schema type options
      type: String,
      required: [true, 'A tour must have a name'], // validator
      unique: true, // We cant have two tour documents with same name
      trim: true,
      maxlength: [40, 'A tour must have less than or equal to 40 characters'],
      minlength: [10, 'A tour must have more than or equal to 10 characters'],
    },
    slug: String,
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
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      // We need this var that points to current document
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation (not to update)
          return val < this.price;
        },
        // message has access to value | {VALUE} is a mongoose feature not JS
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
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
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// get method: as this virtual propert will be created each time we get some data out of DB
tourSchema.virtual('durationWeeks').get(function () {
  // We dont use arrow fun as we need the this keyword
  // which is pointing to the current document
  return this.duration / 7;
});
// NOTE: We cannot use a virtual property in a query as they are technically not part of the DB

// DOCUMENT MIDDLEWARE: runs before .save() and .create() command (not on insertMany, update)
tourSchema.pre('save', function (next) {
  // this = current document thats getting saved
  this.slug = slugify(this.name, { lower: true });
  next(); // will call next middleware in the stack
});

// // post has access to current doc and next
// tourSchema.post('save', function (doc, next) {
//   // Post middleware fun are executed after pre midddeware so we dont have access to this
//   // instead we have the finished doc
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE | find middleware
tourSchema.pre(/^find/, function (next) {
  // this keyword now points to current query
  // NOTE: In api we will see all tours having false secret but thats just done by mongoose as we have set a default value
  // old tours will not have a secretour prop in the db its just added in the API by mongoose
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds!`);
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
