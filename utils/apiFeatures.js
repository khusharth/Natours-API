class APIFeatures {
  // Mongoose query object, Query from route
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // BUILD QUERY: 1A) Filtering
    // req.query has access to the Query strings
    const queryObj = { ...this.queryString };
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
    // let query = Tour.find(JSON.parse(queryStr));
    this.query = this.query.find(JSON.parse(queryStr));

    // Entire object which has access to all the methods
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      // sort a mongoose Query method
      this.query = this.query.sort(sortBy);
    } else {
      // Default sorting
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      // Selecting certain field name is called projecting
      this.query = this.query.select(fields);
    } else {
      // Remove a field by default
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    // || 1 used to specify default value
    const page = this.queryString.page * 1 || 1; // string to number
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    // skip = amount of result that should be skipped before querrying data
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
