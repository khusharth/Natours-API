const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    // console.log(req.query, queryObj);

    // EXECUTE QUERY | Chaining is working as we are returning this
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;

    // const query = Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    // findById() = Tour.findOne({ _id: req.params.id })
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    // M-1 Calling method on the new document
    // const newTour = new Tour({})
    // newTour.save()

    // M-2 Calling method on Tour (Model)
    const newTour = await Tour.create(req.body);

    // 201 = created
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    // 400: Bad Request
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    // findByIdAndUpdate = findOneAndUpdate({ _id: req.params.id }, req.body)
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // new updated document will be returned
      runValidators: true, // run validation again on updated doc
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour: updatedTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    // 204: No content
    // null represents the resource that we deleted now no longer exists
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
    // Each stage (just a query) in pipeline is an obj
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' }, // what we want to group by
          numTours: { $sum: 1 }, // For each doc that will go through this pipeline 1 will be added to num counter
          numRatings: { $sum: '$ratingsAverage' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { avgPrice: 1 }, // 1 for ascending
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
      {
        // Deconstruct an array field from the input document
        // And the output 1 doc for each element of the array
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`), // 1st day of year
            $lte: new Date(`${year}-12-31`), // Last day of the year
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numToursStarts: { $sum: 1 },
          tours: {
            // To create an array | Push the name field
            $push: '$name',
          },
        },
      },
      {
        // To add a new field for month
        $addFields: { month: '$_id' },
      },
      {
        // To hide ID
        $project: {
          _id: 0,
        },
      },
      {
        // 1 for ascending and -1 for descending
        $sort: { numToursStarts: -1 },
      },
      // {
      //   // Limit us to have only 6 documents same as that used in req.query
      //   $limit: 6,
      // },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
