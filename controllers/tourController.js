const Tour = require('../models/tourModel');

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

    // BUILD QUERY: 1A) Filtering
    // req.query has access to the Query strings
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced Filtering
    // MongoDB: { difficulty: 'easy', duration: { $gte: 5 }}
    // req.query: { difficulty: 'easy', duration: { gte: 5 }} | need to add $ operator
    // Sol: Match gte, gt, lte, lt and replace with a $ sign version like $gte
    let queryStr = JSON.stringify(queryObj);

    // replace receive the match str in its callback
    // \b \b for exact word | g: it will happen multiple times without g only 1st will be replaced
    queryStr = queryStr.replace(/\bgte|gt|lte|lt\b/g, (match) => `$${match}`);

    // find method returns an array of JS Objects
    let query = Tour.find(JSON.parse(queryStr));

    // 2) Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      // sort a mongoose Query method
      query = query.sort(sortBy);
    } else {
      // Default sorting
      query = query.sort('-createdAt');
    }

    // 3) Field Limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      // Selecting certain field name is called projecting
      query = query.select(fields);
    } else {
      // Remove a field by default
      query = query.select('-__v');
    }

    // 4) Pagination
    // || 1 used to specify default value
    const page = req.query.page * 1 || 1; // string to number
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;

    // skip = amount of result that should be skipped before querrying data
    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error('This page does not exist ');
    }

    // EXECUTE QUERY
    const tours = await query;

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
