const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controller')
const authController = require('../controllers/auth.controller')

// UC-201 Register as a new user
router.post("/api/user", userController.validateUser, userController.addUser);

// UC-202 Get all users
router.get("/api/user", userController.getAllUsers);

// UC-203 Request personal user profile
router.get("/api/user/profile", authController.validateToken, userController.requestUserProfile);

// UC-204 Get single user by ID
router.get("/api/user/:userId", authController.validateToken, userController.getUserById);

// UC-205 Update a single user
router.put("/api/user/:userId", authController.validateToken, userController.validateUpdatedUser, userController.updateUser);

// UC-206 Delete a user
router.delete("/api/user/:userId", authController.validateToken, userController.deleteUser);

module.exports = router