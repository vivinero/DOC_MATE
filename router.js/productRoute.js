const express = require('express');

const router = express.Router();

const { AddProduct, viewOneProduct, viewAllProduct, updateProduct,  deleteProduct, } = require('../controllers/productControl');
const { authenticate, authenticateAdmin } = require('../middleware/authentication');


//endpoint to Add a new stock product
router.post('/addstock/:userId', authenticate, authenticateAdmin, AddProduct);

//endpoint to view a stock product
router.get('/viewstock/:productId', authenticate, viewOneProduct);

//endpoint to view all stock products
router.get('/viewAllstock/:userId', authenticate, viewAllProduct);

//endpoint to update a stock product
router.put('/updatestock/:productId', authenticate, authenticateAdmin, updateProduct);

//endpoint to delete a stock product
router.delete('/deletestock/:productId/:userId', authenticate, authenticateAdmin, deleteProduct);


module.exports = router;

// const router = require("express").Router();

// const { createProduct, updateProduct, getAllProducts, getProductById, deleteProduct } = require("../controllers/productControl");
// const { authenticateAdmin } = require("../middleware/authentication")
// const upload = require('../middleware/multer')


// router.post('/products/:categoryId', upload.array('images', 5), authenticateAdmin, createProduct);
// router.put('/products/:id', upload.array('images', 5), authenticateAdmin, updateProduct);
// router.get('/get-products', getAllProducts)
// router.get("/get-one-product", getProductById)
// router.delete("/delete-product", authenticateAdmin, deleteProduct)


// module.exports = router