const express = require("express");
const searchProduct = require("../controllers/searchControl");
const router = express.Router();

router.get("/products-search",searchProduct);

module.exports = router