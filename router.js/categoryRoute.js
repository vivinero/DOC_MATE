const router = require("express").Router();


const { createCategory, updateCategory, getAllCategories, getCategoryById, deleteCategory } = require("../controllers/categoryControl");
const { authenticateAdmin } = require("../middleware/authentication")


router.post('/create-category',authenticateAdmin, createCategory)
router.put('/update-category',authenticateAdmin, updateCategory)
router.get('/get-category', getAllCategories)
router.get("/get-one-category", getCategoryById)
router.delete("/delete-category", authenticateAdmin, deleteCategory)


module.exports = router