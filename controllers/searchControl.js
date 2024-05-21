

// Import your Mongoose model
const productModel = require("../models/productModel"); 



// const searchFunction = async (req, res) => {
//   try {
//     const { name, letter} = req.body;
//     let query = {};

//     if (name) {
//       query.name = { $regex: new RegExp(`^${name}`, "i") };
//     }

//     if (letter) {
//       query.letter = { $regex: new RegExp(`^${letter}`, "i") };
//     }
//             // Execute the query using Mongoose find method
//     const results = await productModel.find(query).limit(50); // limit the number of results

//     res.json({ totalResults: results.length, results: results });
//   } catch (error) {
//     res.status(500).json({ error: "An internal server error occurred" });
//   }
// };

const searchProduct = async (req, res) => {
  try {
    // Extract the search query from the request
    const searchQuery = req.query.q;
    //console.log(req.query);
    let products;

    if (searchQuery) {

      // If search query is provided, filter hospitals by name starting with the query
      products = await productModel.find({
        productName: { $regex: `^${searchQuery}`, $options: 'i' }
      })
        .sort({ productName: 1 }); // Sort hospitals alphabetically by name
    } else {
      // If no search query is provided, return an empty array
      products = [];
    }
    //console.log(`Search query: ${searchQuery}`);
    //console.log(`Hospitals: ${products}`);


    if (products.length === 0) {
      return res.status(200).json({ message: "No hospitals found." });
    } else {
      return res.status(200).json({
        message: "List of Products",
        totalNumberOfProducts: products.length,
        data: products
        
      });
      
    }

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }}







module.exports = searchProduct;
