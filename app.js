const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Displays request info on the terminal
}
// need to use this middleware to add the data from the body to the req object
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

// 2) ROUTES

// put: We expect that our app to receive an entire updated object
// patch: We only expect particular updated properties of the object

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

// Mounting a router on a new route
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Only UNHANDLED routes will reach here | all = get, post, put ...
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server!`,
  // });

  // If the next fun receives an argument no matter what it is express will
  // automatcially knows some error happened | Will skip all the middleware and go to the global error handling middleware
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// To define an Error handling middleware we just need to give 4 arguments to the middleware fun
app.use(globalErrorHandler);

module.exports = app;
