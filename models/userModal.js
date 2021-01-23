const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true, // This trasforms email to lowercase
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your paswword'],
    validate: {
      // This only works on .save() or .create()
      // For this reason whenever we want to update the user we will also need to .save()
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
  passwordChangedAt: Date,
});

// Encryption will happen between the momemnt we receive the data
// and the moment it is saved in db
userSchema.pre('save', async function (next) {
  // Only when pass is created or changed
  if (!this.isModified('password')) return next();

  // hash(pass, manual Salt or CPU intensity (cost of 12))
  // More CPU intensity = better encryption
  this.password = await bcrypt.hash(this.password, 12);
  // undefined: To delete it as its only needed for validation
  // required only means required input not to pe persisted in the db
  this.passwordConfirm = undefined;
  next();
});

// In password field we have set select = false due to which
// password will not be available on this keyword (this.password)
// thats why we passin the userPassword too
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  // this = current document
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  // If the property dont exist then it means user never has changed the passwd
  if (this.passwordChangedAt) {
    // to changed to seconds timestamp
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }

  // false = NOT changed
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
