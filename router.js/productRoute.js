const router = require("express").Router();

const { createProduct, updateProduct, getAllProducts, getProductById, deleteProduct } = require("../controllers/productControl");
const { authenticateAdmin } = require("../middleware/authentication")
const upload = require('../middleware/multer')


router.post('/products/:categoryId', upload.array('images', 5), authenticateAdmin, createProduct);
router.put('/products/:id', upload.array('images', 5), authenticateAdmin, updateProduct);
router.get('/get-products', getAllProducts)
router.get("/get-one-product", getProductById)
router.delete("/delete-product", authenticateAdmin, deleteProduct)


module.exports = router