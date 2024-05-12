

// Import your Mongoose model
const categoryModel = require("../models/categoryModel"); 

const searchfunction = async (req, res) => {
    try {
        const { name, letter, category } = req.body;
        let query = {};

        // Build the query based on the search criteria
        if (name) {
            query.name = { $regex: new RegExp(name, "i") };
        }

        if (letter) {
            query.letter = { $regex: new RegExp(`^${letter}`, "i") };
        }

        if (category) {
            query.category = category;
        }

        // Execute the query using Mongoose find method
        const results = await categoryModel.find(query);

        res.json({
            totalResults: results.length,
            results: results
        });
    } catch (error) {
        res.status(500).json({
            error: `An internal server error occurred ${error.message}`
        });
    }
};

module.exports = searchfunction;

