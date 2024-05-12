const Product = require('../models/productModel');
const Category = require('../models/categoryModel')
const cloudinary = require('../middleware/cloudinary')


// Create a new product
exports.createProduct = async (req, res) => {
    try {
        const { userId } = req.user;
        const { categoryId } = req.params;

        if (!userId) {
            return res.status(404).json({
                error: `User not found`
            });
        }

        const theCategory = await Category.findById(categoryId);

        if (!theCategory){
            return res.status(404).json({
                error: `Category not found`
            });
        }

        const { itemName, detail, price } = req.body;
        let images = [];

        // Upload images to Cloudinary
        for (const file of req.files) {
            const result = await cloudinary.uploader.upload(file.path);
            images.push(result.secure_url);
        }

        const newProduct = await Product.create({ itemName, detail, price, images, category: categoryId });
        res.status(201).json({
            message: `Product created successfully`,
            data: newProduct
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

// Update a product by ID
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { itemName, detail, price, imagesToDelete } = req.body;
        let updatedImages = [];

        // Delete images from Cloudinary
        for (const imageId of imagesToDelete) {
            await cloudinary.uploader.destroy(imageId);
        }

        // Upload new images to Cloudinary
        for (const file of req.files) {
            const result = await cloudinary.uploader.upload(file.path);
            updatedImages.push(result.secure_url);
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, { itemName, detail, price, $push: { images: { $each: updatedImages } } }, { new: true });

        if (!updatedProduct) {
            return res.status(404).json({
                error: 'Product not found'
            });
        }

        res.status(200).json({
            message: `Product updated`,
            data: updatedProduct
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};



// Delete a product by ID
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).json({
                error: 'Product not found'
            });
        }
        res.status(200).json({
            message: `Product deleted`,
            data: {}
        });
    } catch (error){
        res.status(500).json({
            error: error.message
        });
    }
};

// Get a product by ID
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id).populate('category');
        if (!product) {
            return res.status(404).json({
                error: 'Product not found' 
            });
        }
        res.status(200).json({
            message: `Product fetched`,
            data: product
        });
    } catch (error) {
        res.status(500).json({
        error: error.message
    });
    }
};

// Get all products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('category');
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
