// FILE: backend/routes/NutritionRoutes.js

const express = require('express');
const router = express.Router();
const nutritionController = require('../controllers/NutritionController');

// Route lấy danh sách công thức đã lọc
// Ví dụ request: GET /api/nutrition/recipes?goal=Giảm%20mỡ&calorie=300-500%20Calo&search=gà
router.get('/', nutritionController.getRecipes);

// Route lấy chi tiết 1 công thức
// router.get('/recipes/:id', nutritionController.getRecipeById); 

module.exports = router;