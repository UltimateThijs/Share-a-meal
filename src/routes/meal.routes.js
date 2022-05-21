const express = require('express')
const router = express.Router()
const mealController = require('../controllers/meal.controller')
const authController = require('../controllers/auth.controller')

// UC-301 Register a meal
router.post("/api/meal", mealController.validateMeal, mealController.addMeal);

// UC-303 Get all meals
router.get("/api/meal", mealController.getAllMeals);

// UC-304 Get single meal by ID
router.get("/api/meal/:mealId", mealController.getMealById);

// UC-302 Update a single meal
router.put("/api/meal/:mealId", authController.validateToken, mealController.validateUpdatedMeal, mealController.updateMeal);

// UC-305 Delete a meal
//router.delete("/api/meal/:mealId", authController.validateToken, mealController.deleteMeal);

module.exports = router