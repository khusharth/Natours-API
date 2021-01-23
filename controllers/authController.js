const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModal');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signInToken = (id) => {
  // 3rd para: Time after which user should logout
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Not calling it createUser as signUp as more meaing in terms of authentication
exports.signup = catchAsync(async (req, res, next) => {
  // const newUser = await User.create({req.body}) SECURITY FLAW
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  const token = signInToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });

  next();
});

exports.login = catchAsync(async (req, res, next) => {
  //   const email = req.body.email;
  const { email, password } = req.body;
  // 1) Check if Email and password exist
  if (!email || !password) {
    // We use return so that after calling next the login function finished right away
    return next(new AppError('Please provide email and password', 400));
  }
  // 2) Check if user exist and password is correct
  //  As findOne don't select passowrd we need to manually select it with + sign
  const user = await User.findOne({ email: email }).select('+password');
  // Compare password
  // const correct = user.correctPassword(password, user.password);

  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('Incorrect email or password', 401));

  // 3) If everything ok, send token to client
  const token = signInToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if its there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token)
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  // 2) Verification token
  // 3rd argument = callback function as verify is async
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  // This is the reason we have ID in the payload
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(
      new AppError('The user belonging to the token no longer exist', 401)
    );

  // 4) Check if user changed password after the JWT token was issued
  // iat = issued At
  if (currentUser.changedPasswordAfter(decoded.iat))
    return next(
      new AppError('User recently changed password! Please log in again', 401)
    );

  // PUT user data on request
  req.user = currentUser;

  // GRANT ACEESS TO PROTECTED ROUTE
  next();
});

exports.restrictTo = (...roles) => {
  // The below fun gets access to roles param cause of the closure
  return (req, res, next) => {
    // roles eg: ['admin', 'lead-guide']
    if (!roles.includes(req.user.role))
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    // 403 = Forbidden

    next();
  };
};
