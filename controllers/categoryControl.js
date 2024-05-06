const Category = require('../models/categoryModel');

// Create a new category
exports.createCategory = async (req, res) => {
    try {
        const { categoryName, categoryInfo } = req.body;
        const category = await Category.create({ categoryName, categoryInfo });
        res.status(201).json({ 
            message: `Category added successfully`,
            data: category
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

// Update an existing category
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { categoryName, categoryInfo } = req.body;
        const updatedCategory = await Category.findByIdAndUpdate(id, { categoryName, categoryInfo }, { new: true });
        if (!updatedCategory) {
            return res.status(404).json({
                error: 'Category not found'
            });
        }
        res.status(200).json({
            message: `Category updated successfully`,
            data: updatedCategory
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCategory = await Category.findByIdAndDelete(id);
        if (!deletedCategory) {
            return res.status(404).json({
                error: 'Category not found'
            });
        }
        res.status(200).json({
            message: `Category deleted`,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

// Get a single category by ID
exports.getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findById(id).populate('products');
        if (!category) {
            return res.status(404).json({
                error: 'Category not found'
            });
        }
        res.status(200).json({
            message: `Category fetched`,
            data: category
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().populate('products');
        res.status(200).json({
            message: `There are ${categories.length} categories here`,
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};
