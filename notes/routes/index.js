const express = require("express");
const router = express.Router();
const { limit } = require("../middlewares/limiter");
const { homePage } = require("../controllers/index");

/* GET home page. */
router.get("/", limit, homePage);

module.exports = router;
