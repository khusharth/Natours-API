const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

// FOR A USER
// Special route for user which does not follow the REST Archi
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// FOR ADMIN
// We will also keeps the REST routes as there is a possibility
// of a Sys admin to add, update, delete or get user by ID

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
