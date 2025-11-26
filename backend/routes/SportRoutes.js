const express = require("express");
const { getAllSports, getSportDetail } = require('../controllers/sportController');

const sportRouter = express.Router();

sportRouter.get("/", getAllSports);       // API: /api/sports
sportRouter.get("/:slug", getSportDetail); // API: /api/sports/bong-da

module.exports = { sportRouter };