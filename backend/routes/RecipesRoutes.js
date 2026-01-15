// File: routes/RecipesRoutes.js
const express = require('express');
const recipesController = require('../controllers/RecipeController'); // Nhớ file này tên RecipeController (không s)
const authMiddleware = require("../middlewares/AuthMiddleware");
const { checkRole } = require("../middlewares/checkRole");

const recipesRouter = express.Router();

// 1. ROUTE PUBLIC (Dành cho RecipeSection - User xem)
// URL: https://vietlife-fitness-website-host.onrender.com/recipes
recipesRouter.get("/", recipesController.getRecipesPublic);
recipesRouter.get("/:id", recipesController.getRecipeByIdPublic);

// 2. ROUTE ADMIN (Dành cho RecipeManager - Admin quản lý)
// URL: https://vietlife-fitness-website-host.onrender.com/recipes/admin-list
recipesRouter.get("/admin-list", authMiddleware, checkRole(['admin', 'pt']), recipesController.getRecipesAdmin);

// 3. CÁC ROUTE CRUD KHÁC (Admin)
recipesRouter.post("/create", authMiddleware, checkRole(['admin', 'pt']), recipesController.createRecipe);
recipesRouter.put("/:id", authMiddleware, checkRole(['admin', 'pt']), recipesController.updateRecipe);
recipesRouter.delete("/:id", authMiddleware, checkRole(['admin', 'pt']), recipesController.deleteRecipe);

module.exports = { recipesRouter };