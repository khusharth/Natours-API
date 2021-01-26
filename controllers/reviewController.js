const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {}; // All review
  if (req.params.tourId) filter = { tour: req.params.tourId };

  const reviews = await Review.find(filter);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
  next();
});

exports.createReview = catchAsync(async (req, res, next) => {
  // ALLOW NESTED ROUTES
  // If we are not mentiong tourId / userId on body then assign it from the route
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  // If there are any fields in the body that are not in the schema then they will be ignored
  // Thats why we can use req.body here
  const newReview = await Review.create(req.body);

  // 201 = created
  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
  next();
});
