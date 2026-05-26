const express = require('express');
const router = express.Router();
const { generateMeals } = require('../controllers/mealsController');

router.post('/', generateMeals);

module.exports = router;
